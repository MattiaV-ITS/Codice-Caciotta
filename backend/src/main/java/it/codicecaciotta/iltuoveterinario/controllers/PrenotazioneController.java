package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneDTO;
import it.codicecaciotta.iltuoveterinario.mappers.PrenotazioneMapper;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.services.PrenotazioneService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    PrenotazioneController(PrenotazioneService prenotazioneService, 
                          AnimaleRepository animaleRepository, 
                          ProprietarioRepository proprietarioRepository) {
        this.prenotazioneService = prenotazioneService;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<PrenotazioneDTO>> getAllPrenotazioni() {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getAllPrenotazioni()
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrenotazioneDTO> getPrenotazioneById(@PathVariable Long id) {
        return prenotazioneService.getPrenotazioneById(id)
                .map(PrenotazioneMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPrenotazione(@Valid @RequestBody PrenotazioneCreateDTO prenotazioneDTO) {
        try {
            Prenotazione prenotazione = PrenotazioneMapper.toEntity(prenotazioneDTO, animaleRepository, proprietarioRepository);
            Prenotazione createdPrenotazione = prenotazioneService.createPrenotazione(prenotazione);
            // Return DTO instead of entity to avoid LazyInitializationException
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
    public ResponseEntity<?> updatePrenotazione(
            @PathVariable Long id, 
            @RequestBody Prenotazione prenotazioneDetails) {
        try {
            Prenotazione updatedPrenotazione = prenotazioneService.updatePrenotazione(id, prenotazioneDetails);
            // Return DTO instead of entity to avoid LazyInitializationException
            PrenotazioneDTO resultDTO = PrenotazioneMapper.toDTO(updatedPrenotazione);
            return ResponseEntity.ok(resultDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Internal server error",
                "message", "Failed to update prenotazione: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrenotazione(@PathVariable Long id) {
        prenotazioneService.deletePrenotazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/animale/{animaleId}")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByAnimale(@PathVariable Long animaleId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByAnimale(animaleId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/proprietario/{proprietarioId}")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByProprietario(@PathVariable Long proprietarioId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByProprietario(proprietarioId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/range")
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
    public ResponseEntity<?> getVisitaForPrenotazione(@PathVariable Long prenotazioneId) {
        try {
            logger.info("Checking visita for prenotazione ID: {}", prenotazioneId);
            
            Optional<Visita> visitaOptional = prenotazioneService.getVisitaForPrenotazione(prenotazioneId);
            
            if (visitaOptional.isPresent()) {
                Visita visita = visitaOptional.get();
                logger.info("Found visita with ID: {}", visita != null ? visita.getId() : "null");
                // Access only the ID to avoid lazy loading issues
                Long visitaId = visita != null ? visita.getId() : null;
                // Use HashMap instead of Map.of to allow null values
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("visitaId", visitaId);
                return ResponseEntity.ok().body(response);
            } else {
                logger.info("No visita found for prenotazione ID: {}", prenotazioneId);
                // Use HashMap instead of Map.of to allow null values
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