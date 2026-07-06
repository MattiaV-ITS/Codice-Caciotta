package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VisitaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VisitaSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.services.DiarioClinicoService;
import it.codicecaciotta.iltuoveterinario.services.VisitaService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/visite")
public class VisitaController {

    private final VisitaService visitaService;

    public VisitaController(VisitaService visitaService, DiarioClinicoService diarioService) {
        this.visitaService = visitaService;
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<VisitaSchedaDTO>> getVisiteByAnimaleId(@PathVariable @NonNull Long animaleId) {
        List<VisitaSchedaDTO> visiteDTO = visitaService.getVisiteByAnimaleId(animaleId)
                .stream()
                .map(VisitaSchedaMapper::toSchedaDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(visiteDTO);
    }

    @GetMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<VisitaSchedaDTO> getVisitaById(@PathVariable @NonNull Long visitaId) {
        VisitaSchedaDTO visitaDTO = VisitaSchedaMapper.toSchedaDTO(visitaService.getVisitaById(visitaId));
        return ResponseEntity.ok(visitaDTO);
    }

    @PostMapping("/api/visite/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> createVisita(
            @PathVariable @NonNull Long animaleId,
            @Valid @RequestBody VisitaCreateDTO visitaDTO) {
                Visita createdVisita = visitaService.createVisita(animaleId, visitaDTO);
                URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdVisita.getId())
                .toUri();

            return ResponseEntity.created(location).body(VisitaSchedaMapper.toSchedaDTO(createdVisita));
    }

    @PatchMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> updateVisita(
            @PathVariable @NonNull Long visitaId,
            @Valid @RequestBody VisitaUpdateDTO visitaUpdateDTO) {
        Visita updatedVisita = visitaService.updateVisita(visitaId, visitaUpdateDTO);
        return ResponseEntity.ok(VisitaSchedaMapper.toSchedaDTO(updatedVisita));
    }

    @DeleteMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')") //TODO: chi può cancellare una visita? Solo lo staff o anche l'admin? Usare flag per cancellazione staff, delete per admin?
    public ResponseEntity<Void> deleteVisita(@PathVariable @NonNull Long visitaId) {
        visitaService.deleteVisita(visitaId);
        return ResponseEntity.noContent().build();
    }
}