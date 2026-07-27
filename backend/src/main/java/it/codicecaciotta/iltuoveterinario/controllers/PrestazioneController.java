package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.services.PrestazioneService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prestazioni")
public class PrestazioneController {

    private final PrestazioneService prestazioneService;
    private final PaginationAndSortingUtils paginationUtils;
    public PrestazioneController(PrestazioneService prestazioneService,
                                 PaginationAndSortingUtils paginationUtils) {
        this.prestazioneService = prestazioneService;
        this.paginationUtils = paginationUtils;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public Page<Prestazione> getAllPrestazioni(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nomePrestazione") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String stato
    ) {
        Pageable pageable = paginationUtils.buildPageRequest(page, size, sortBy, sortDir,
                Arrays.asList("nomePrestazione", "durataStimata", "costoBase", "stato"));

        return prestazioneService.findByFilters(search, stato, pageable);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Prestazione>> getAllPrestazioniSimple() {
        List<Prestazione> prestazioni = prestazioneService.getAllPrestazioni();
        return ResponseEntity.ok(prestazioni);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Prestazione> getPrestazioneById(@PathVariable Long id) {
        Optional<Prestazione> prestazione = prestazioneService.getPrestazioneById(id);
        return prestazione.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Prestazione> createPrestazione(@RequestBody Prestazione prestazione) {
        Prestazione createdPrestazione = prestazioneService.createPrestazione(prestazione);
        return ResponseEntity.ok(createdPrestazione);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Prestazione> updatePrestazione(@PathVariable Long id,
                                                         @RequestBody Prestazione prestazione) {
        Prestazione updatedPrestazione = prestazioneService.updatePrestazione(id, prestazione);
        return ResponseEntity.ok(updatedPrestazione);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePrestazione(@PathVariable Long id) {
        prestazioneService.deletePrestazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/disponibili")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Prestazione>> getPrestazioniDisponibili() {
        List<Prestazione> prestazioni = prestazioneService.getPrestazioniDisponibili();
        return ResponseEntity.ok(prestazioni);
    }
}