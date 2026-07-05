package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mapper.VaccinazioneListaMapper;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneService;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/vaccinazioni")
public class VaccinazioneController {

    private final VaccinazioneService vaccinazioneService;
    private final VaccinazioneListaMapper vaccinazioneListaMapper;

    public VaccinazioneController(VaccinazioneService vaccinazioneService, VaccinazioneListaMapper vaccinazioneListaMapper) {
        this.vaccinazioneService = vaccinazioneService;
        this.vaccinazioneListaMapper = vaccinazioneListaMapper;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> createVaccinazione(@Valid @RequestBody VaccinazioneCreateDTO vaccinazioneCreateDTO) {
        Vaccinazione createdVaccinazione = vaccinazioneService.createVaccinazione(vaccinazioneCreateDTO);
        
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdVaccinazione.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdVaccinazione);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> updateVaccinazione(@PathVariable @NonNull Long id, @Valid @RequestBody VaccinazioneUpdateDTO vaccinazioneUpdateDTO) {
        Vaccinazione updatedVaccinazione = vaccinazioneService.updateVaccinazione(id, vaccinazioneUpdateDTO);
        return ResponseEntity.ok(updatedVaccinazione);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVaccinazione(@PathVariable @NonNull Long id) {
        vaccinazioneService.deleteVaccinazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> getVaccinazioneById(@PathVariable @NonNull Long id) {
        Vaccinazione vaccinazione = vaccinazioneService.getVaccinazioneById(id);
        return ResponseEntity.ok(vaccinazione);
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<VaccinazioneListaDTO>> getVaccinazioniByAnimaleId(@PathVariable @NonNull Long animaleId) {
        List<Vaccinazione> vaccinazioni = vaccinazioneService.getVaccinazioniByAnimaleId(animaleId);
        List<VaccinazioneListaDTO> vaccinazioneListaDTOs = vaccinazioni.stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(vaccinazioneListaDTOs);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<VaccinazioneListaDTO>> getAllVaccinazioni() {
        List<Vaccinazione> vaccinazioni = vaccinazioneService.getAllVaccinazioni();
        List<VaccinazioneListaDTO> vaccinazioneListaDTOs = vaccinazioni.stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(vaccinazioneListaDTOs);
    }


}