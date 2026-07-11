package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VisitaSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.services.DiarioClinicoService;
import it.codicecaciotta.iltuoveterinario.services.VisitaService;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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
    private final DiarioClinicoService diarioClinicoService;

    public VisitaController(VisitaService visitaService, DiarioClinicoService diarioClinicoService) {
        this.visitaService = visitaService;
        this.diarioClinicoService = diarioClinicoService;
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<VisitaSchedaDTO>> getVisiteByAnimaleId(@PathVariable Long animaleId) {
        if (animaleId == null) {
            return ResponseEntity.badRequest().build();
        }
        List<VisitaSchedaDTO> visiteDTO = visitaService.getVisiteByAnimaleId(animaleId)
                .stream()
                .map(VisitaSchedaMapper::toSchedaDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(visiteDTO);
    }

    @GetMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<VisitaSchedaDTO> getVisitaById(@PathVariable Long visitaId) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().build();
        }
        VisitaSchedaDTO visitaDTO = VisitaSchedaMapper.toSchedaDTO(visitaService.getVisitaById(visitaId));
        return ResponseEntity.ok(visitaDTO);
    }

    @PostMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> createVisitaScheda(
            @PathVariable Long animaleId,
            @Valid @RequestBody VisitaSchedaCreateDTO visitaDTO) {
        if (animaleId == null) {
            return ResponseEntity.badRequest().build();
        }
                Visita createdVisita = visitaService.createVisitaScheda(animaleId, visitaDTO);
                URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdVisita.getId())
                .toUri();

            return ResponseEntity.created(location).body(VisitaSchedaMapper.toSchedaDTO(createdVisita));
    }

    @PatchMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> updateVisitaScheda(
            @PathVariable Long visitaId,
            @Valid @RequestBody VisitaSchedaUpdateDTO visitaUpdateDTO) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().build();
        }
        Visita updatedVisita = visitaService.updateVisitaScheda(visitaId, visitaUpdateDTO);
        return ResponseEntity.ok(VisitaSchedaMapper.toSchedaDTO(updatedVisita));
    }

    @DeleteMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')") //TODO: chi può cancellare una visita? Solo lo staff o anche l'admin? Usare flag per cancellazione staff, delete per admin?
    public ResponseEntity<Void> deleteVisita(@PathVariable Long visitaId) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().build();
        }
        visitaService.deleteVisita(visitaId);
        return ResponseEntity.noContent().build();
    }
}