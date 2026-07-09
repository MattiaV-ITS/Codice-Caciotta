package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneService;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneListaService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/vaccinazioni")
public class VaccinazioneController {

    private final VaccinazioneService vaccinazioneService;
    private final VaccinazioneListaService vaccinazioneListaService;
    private final PaginationAndSortingUtils paginationUtils;

    private static final java.util.List<String> ALLOWED_SORT_FIELDS =
            java.util.List.of("id", "tipoVaccino", "dataSomministrazione", "dataScadenza", "lotto", "note", "animale.nome");

    public VaccinazioneController(
            VaccinazioneService vaccinazioneService,
            VaccinazioneListaService vaccinazioneListaService,
            PaginationAndSortingUtils paginationUtils) {

        this.vaccinazioneService = vaccinazioneService;
        this.vaccinazioneListaService = vaccinazioneListaService;
        this.paginationUtils = paginationUtils;
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
            @PathVariable @NonNull Long id,
            @Valid @RequestBody VaccinazioneUpdateDTO dto) {

        return ResponseEntity.ok(vaccinazioneService.updateVaccinazione(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVaccinazione(@PathVariable @NonNull Long id) {
        vaccinazioneService.deleteVaccinazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getVaccinazioneById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(vaccinazioneService.getVaccinazioneById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
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
