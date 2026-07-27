package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneDTO;
import it.codicecaciotta.iltuoveterinario.mappers.PrenotazioneMapper;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.security.services.UserDetailsImpl;
import it.codicecaciotta.iltuoveterinario.services.PrenotazioneService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    private static final Logger logger = LoggerFactory.getLogger(PrenotazioneController.class);

    private final PrenotazioneService prenotazioneService;
    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;
    private final UtenteRepository utenteRepository;

    PrenotazioneController(PrenotazioneService prenotazioneService, 
                          AnimaleRepository animaleRepository, 
                          ProprietarioRepository proprietarioRepository,
                          UtenteRepository utenteRepository) {
        this.prenotazioneService = prenotazioneService;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
        this.utenteRepository = utenteRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PrenotazioneDTO>> getAllPrenotazioni(
            @RequestParam(required = false) Long proprietarioId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        // For regular users (ROLE_USER), force filtering by their own proprietarioId
        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Utente currentUser = utenteRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            if (currentUser.getProprietario() != null) {
                proprietarioId = currentUser.getProprietario().getId();
            } else {
                return ResponseEntity.ok(List.of());
            }
        }

        List<PrenotazioneDTO> prenotazioniDTO;
        if (proprietarioId != null) {
            prenotazioniDTO = prenotazioneService.getPrenotazioniByProprietario(proprietarioId)
                    .stream()
                    .map(PrenotazioneMapper::toDTO)
                    .collect(Collectors.toList());
        } else {
            prenotazioniDTO = prenotazioneService.getAllPrenotazioni()
                    .stream()
                    .map(PrenotazioneMapper::toDTO)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PrenotazioneDTO> getPrenotazioneById(@PathVariable Long id) {
        Optional<Prenotazione> prenotazioneOpt = prenotazioneService.getPrenotazioneById(id);
        if (prenotazioneOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        // For regular users (ROLE_USER), verify they own this prenotazione
        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Utente currentUser = utenteRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            Prenotazione prenotazione = prenotazioneOpt.get();
            if (currentUser.getProprietario() == null ||
                !currentUser.getProprietario().getId().equals(
                    prenotazione.getProprietario() != null ? prenotazione.getProprietario().getId() : null)) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(PrenotazioneMapper.toDTO(prenotazioneOpt.get()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createPrenotazione(@Valid @RequestBody PrenotazioneCreateDTO prenotazioneDTO) {
        try {
            Prenotazione prenotazione = PrenotazioneMapper.toEntity(prenotazioneDTO, animaleRepository, proprietarioRepository);
            Prenotazione createdPrenotazione = prenotazioneService.createPrenotazione(prenotazione);
            PrenotazioneDTO resultDTO = PrenotazioneMapper.toDTO(createdPrenotazione);
            return ResponseEntity.ok(resultDTO);
        } catch (jakarta.validation.ConstraintViolationException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "message", e.getMessage(),
                "details", e.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .collect(Collectors.toList())
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Bad request",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Internal server error",
                "message", "Failed to create prenotazione: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updatePrenotazione(
            @PathVariable Long id, 
            @RequestBody PrenotazioneUpdateDTO prenotazioneDTO) {
        try {
            logger.info("Updating prenotazione ID: {}", id);
            logger.debug("Update DTO: dataOraAppuntamento={}, tipoVisita={}, animaleId={}, proprietarioId={}",
                prenotazioneDTO.getDataOraAppuntamento(),
                prenotazioneDTO.getTipoVisita(),
                prenotazioneDTO.getAnimaleId(),
                prenotazioneDTO.getProprietarioId());
            
            Prenotazione prenotazioneDetails = PrenotazioneMapper.toEntity(prenotazioneDTO, animaleRepository, proprietarioRepository);
            Prenotazione updatedPrenotazione = prenotazioneService.updatePrenotazione(id, prenotazioneDetails);
            PrenotazioneDTO resultDTO = PrenotazioneMapper.toDTO(updatedPrenotazione);
            logger.info("Successfully updated prenotazione ID: {}", id);
            return ResponseEntity.ok(resultDTO);
        } catch (IllegalArgumentException e) {
            logger.warn("Validation failed for prenotazione ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation error",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Failed to update prenotazione ID {}", id, e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Internal server error",
                "message", "Failed to update prenotazione: " + e.getMessage()
            ));
        }
    }

    @PatchMapping("/{id}/stato")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateStatoPrenotazione(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String nuovoStato = body.get("stato");
            if (nuovoStato == null || nuovoStato.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Il campo 'stato' è obbligatorio"));
            }
            Prenotazione updated = prenotazioneService.updateStato(id, nuovoStato);
            PrenotazioneDTO resultDTO = PrenotazioneMapper.toDTO(updated);
            return ResponseEntity.ok(resultDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Errore aggiornando lo stato: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePrenotazione(@PathVariable Long id) {
        prenotazioneService.deletePrenotazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByAnimale(@PathVariable Long animaleId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByAnimale(animaleId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/proprietario/{proprietarioId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByProprietario(@PathVariable Long proprietarioId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByProprietario(proprietarioId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/range")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByDateRange(startDate, endDate)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @PostMapping("/{prenotazioneId}/visita")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createVisitaFromPrenotazione(@PathVariable Long prenotazioneId) {
        try {
            return prenotazioneService.createVisitaFromPrenotazione(prenotazioneId)
                    .map(visita -> ResponseEntity.ok().body(Map.of("visitaId", visita.getId())))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Internal server error",
                "message", "Failed to create visita from prenotazione: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{prenotazioneId}/visita")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getVisitaForPrenotazione(@PathVariable Long prenotazioneId) {
        try {
            logger.info("Checking visita for prenotazione ID: {}", prenotazioneId);
            
            Optional<Visita> visitaOptional = prenotazioneService.getVisitaForPrenotazione(prenotazioneId);
            
            if (visitaOptional.isPresent()) {
                Visita visita = visitaOptional.get();
                logger.info("Found visita with ID: {}", visita != null ? visita.getId() : "null");
                Long visitaId = visita != null ? visita.getId() : null;
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("visitaId", visitaId);
                return ResponseEntity.ok().body(response);
            } else {
                logger.info("No visita found for prenotazione ID: {}", prenotazioneId);
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("visitaId", null);
                return ResponseEntity.ok().body(response);
            }
        } catch (Exception e) {
            logger.error("Error getting visita for prenotazione ID {}: {}", prenotazioneId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Internal server error",
                "message", "Failed to get visita for prenotazione: " + e.getMessage()
            ));
        }
    }
}
