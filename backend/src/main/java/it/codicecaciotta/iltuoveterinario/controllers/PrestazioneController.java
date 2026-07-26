package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import it.codicecaciotta.iltuoveterinario.services.PrestazioneService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/prestazioni")
public class PrestazioneController {

    private final PrestazioneService prestazioneService;

    private final PaginationAndSortingUtils paginationUtils;

    private final PrestazioneRepository prestazioneRepository;

    PrestazioneController(PrestazioneService prestazioneService, PaginationAndSortingUtils paginationUtils, PrestazioneRepository prestazioneRepository) {
        this.prestazioneService = prestazioneService;
        this.paginationUtils = paginationUtils;
        this.prestazioneRepository = prestazioneRepository;
    }

    @GetMapping
    public Page<Prestazione> getAllPrestazioni(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nomePrestazione") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Pageable pageable = paginationUtils.buildPageRequest(page, size, sortBy, sortDir,
                java.util.Arrays.asList("nomePrestazione", "durataStimata", "costoBase", "stato"));

        return prestazioneRepository.findAll(pageable);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Prestazione>> getAllPrestazioniSimple() {
        List<Prestazione> prestazioni = prestazioneService.getAllPrestazioni();
        return ResponseEntity.ok(prestazioni);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prestazione> getPrestazioneById(@PathVariable Long id) {
        Optional<Prestazione> prestazione = prestazioneService.getPrestazioneById(id);
        return prestazione.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Prestazione> createPrestazione(@RequestBody Prestazione prestazione) {
        Prestazione createdPrestazione = prestazioneService.createPrestazione(prestazione);
        return ResponseEntity.ok(createdPrestazione);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prestazione> updatePrestazione(@PathVariable Long id, @RequestBody Prestazione prestazione) {
        Prestazione updatedPrestazione = prestazioneService.updatePrestazione(id, prestazione);
        return ResponseEntity.ok(updatedPrestazione);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrestazione(@PathVariable Long id) {
        prestazioneService.deletePrestazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/disponibili")
    public ResponseEntity<List<Prestazione>> getPrestazioniDisponibili() {
        List<Prestazione> prestazioni = prestazioneService.getPrestazioniDisponibili();
        return ResponseEntity.ok(prestazioni);
    }

}