package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.security.services.UserDetailsImpl;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneService;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneListaService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.Objects;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/vaccinazioni")
public class VaccinazioneController {

    private final VaccinazioneService vaccinazioneService;
    private final VaccinazioneListaService vaccinazioneListaService;
    private final PaginationAndSortingUtils paginationUtils;
    private final UtenteRepository utenteRepository;
    private final AnimaleRepository animaleRepository;

    private static final java.util.List<String> ALLOWED_SORT_FIELDS =
            java.util.List.of("id", "tipoVaccino", "dataSomministrazione", "dataScadenza", "lotto", "note", "animale.nome");

    public VaccinazioneController(
            VaccinazioneService vaccinazioneService,
            VaccinazioneListaService vaccinazioneListaService,
            PaginationAndSortingUtils paginationUtils,
            UtenteRepository utenteRepository,
            AnimaleRepository animaleRepository) {

        this.vaccinazioneService = vaccinazioneService;
        this.vaccinazioneListaService = vaccinazioneListaService;
        this.paginationUtils = paginationUtils;
        this.utenteRepository = utenteRepository;
        this.animaleRepository = animaleRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> createVaccinazione(@Valid @RequestBody VaccinazioneCreateDTO dto) {

        var created = vaccinazioneService.createVaccinazione(dto);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateVaccinazione(
            @PathVariable Long id,
            @Valid @RequestBody VaccinazioneUpdateDTO dto) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(vaccinazioneService.updateVaccinazione(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVaccinazione(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        vaccinazioneService.deleteVaccinazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<?> getVaccinazioneById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        Vaccinazione vaccinazione = vaccinazioneService.getVaccinazioneById(id);

        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = Objects.requireNonNull(userDetails.getId(), "User ID cannot be null");
            Utente currentUser = utenteRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not found"));

            Animale animale = vaccinazione.getAnimale();
            if (animale == null || animale.getProprietario() == null ||
                !animale.getProprietario().getId().equals(
                    currentUser.getProprietario() != null ? currentUser.getProprietario().getId() : null)) {
                return ResponseEntity.status(403).build();
            }
        }

        return ResponseEntity.ok(vaccinazione);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public Page<VaccinazioneListaDTO> getVaccinazioni(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "dataScadenza") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stato,
            @RequestParam(required = false) Long animaleId) {

        Pageable pageable = paginationUtils.buildPageRequest(
                page, size, sortBy, sortDir, ALLOWED_SORT_FIELDS);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = Objects.requireNonNull(userDetails.getId(), "User ID cannot be null");
            Utente currentUser = utenteRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            if (currentUser.getProprietario() == null) {
                return Page.empty();
            }
            Long proprietarioId = currentUser.getProprietario().getId();

            if (animaleId != null) {
                Animale animale = animaleRepository.findById(animaleId).orElse(null);
                if (animale != null && animale.getProprietario() != null &&
                    animale.getProprietario().getId().equals(proprietarioId)) {
                    return vaccinazioneListaService.getVaccinazioniByAnimale(animaleId, pageable);
                }
                return Page.empty();
            }

            return vaccinazioneListaService.getVaccinazioniByProprietario(proprietarioId, pageable);
        }

        if (search != null && !search.isBlank()) {
            return vaccinazioneListaService.searchVaccinazioni(search.trim(), pageable);
        }

        if (stato != null && !stato.isBlank()) {
            return vaccinazioneListaService.getVaccinazioniByStato(stato.trim(), pageable);
        }

        if (animaleId != null) {
            return vaccinazioneListaService.getVaccinazioniByAnimale(animaleId, pageable);
        }

        return vaccinazioneListaService.getAllVaccinazioni(pageable);
    }
}