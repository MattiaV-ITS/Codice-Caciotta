package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VisitaSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.services.VisitaService;
import jakarta.persistence.EntityNotFoundException;
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

    public VisitaController(VisitaService visitaService) {
        this.visitaService = visitaService;
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<VisitaSchedaDTO>> getVisiteByAnimaleId(@PathVariable Long animaleId) {
        if (animaleId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            List<VisitaSchedaDTO> visiteDTO = visitaService.getVisiteByAnimaleId(animaleId)
                    .stream()
                    .map(VisitaSchedaMapper::toSchedaDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(visiteDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<VisitaSchedaDTO> getVisitaById(@PathVariable Long visitaId) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            VisitaSchedaDTO visitaDTO = VisitaSchedaMapper.toSchedaDTO(visitaService.getVisitaById(visitaId));
            return ResponseEntity.ok(visitaDTO);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> createVisitaScheda(
            @PathVariable Long animaleId,
            @Valid @RequestBody VisitaSchedaCreateDTO visitaDTO) {
        if (animaleId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            Visita createdVisita = visitaService.createVisitaScheda(animaleId, visitaDTO);
            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(createdVisita.getId())
                    .toUri();
            return ResponseEntity.created(location).body(VisitaSchedaMapper.toSchedaDTO(createdVisita));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PatchMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VisitaSchedaDTO> updateVisitaScheda(
            @PathVariable Long visitaId,
            @Valid @RequestBody VisitaSchedaUpdateDTO visitaUpdateDTO) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().body(null);
        }
        try {
            Visita updatedVisita = visitaService.updateVisitaScheda(visitaId, visitaUpdateDTO);
            return ResponseEntity.ok(VisitaSchedaMapper.toSchedaDTO(updatedVisita));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')") //TODO: chi può cancellare una visita? Solo lo staff o anche l'admin? Usare flag per cancellazione staff, delete per admin?
    public ResponseEntity<Void> deleteVisita(@PathVariable Long visitaId) {
        if (visitaId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            visitaService.deleteVisita(visitaId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}