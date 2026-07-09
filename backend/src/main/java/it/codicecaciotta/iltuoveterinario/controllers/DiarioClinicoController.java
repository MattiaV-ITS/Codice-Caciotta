package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.DiarioClinicoCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.DiarioClinicoUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
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

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/DiarioClinico")
public class DiarioClinicoController {

    private final DiarioClinicoService diarioClinicoService;
    private final VisitaService visitaService;

    public DiarioClinicoController(DiarioClinicoService diarioClinicoService, VisitaService visitaService) {
        this.diarioClinicoService = diarioClinicoService;
        this.visitaService = visitaService;
    }

    // Il diario clinico contiene note private (notePrivate) visibili solo al
    // veterinario: per questo, a differenza di altre risorse, tutte le
    // operazioni sono riservate a STAFF/ADMIN e non aperte a ROLE_USER.

    @PostMapping("/visita/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DiarioClinico> createDiarioClinico(
            @PathVariable @NonNull Long visitaId,
            @Valid @RequestBody DiarioClinicoCreateDTO dto) {

        Visita visita = visitaService.getVisitaById(visitaId);

        DiarioClinico diarioClinico = new DiarioClinico();
        diarioClinico.setSintomi(dto.getSintomi());
        diarioClinico.setDiagnosi(dto.getDiagnosi());
        diarioClinico.setTrattamentoTerapia(dto.getTrattamentoTerapia());
        diarioClinico.setNote(dto.getNote());
        diarioClinico.setNotePrivate(dto.getNotePrivate());
        diarioClinico.setVisita(visita);

        DiarioClinico created = diarioClinicoService.createDiarioClinico(diarioClinico);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .replacePath("/api/DiarioClinico/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DiarioClinico> getDiarioClinicoById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(diarioClinicoService.getDiarioClinicoById(id));
    }

    @GetMapping("/visita/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DiarioClinico> getDiarioClinicoByVisitaId(@PathVariable @NonNull Long visitaId) {
        return ResponseEntity.ok(diarioClinicoService.getDiarioClinicoByVisitaId(visitaId));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DiarioClinico> updateDiarioClinico(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody DiarioClinicoUpdateDTO dto) {

        DiarioClinico diarioClinico = new DiarioClinico();
        diarioClinico.setSintomi(dto.getSintomi());
        diarioClinico.setDiagnosi(dto.getDiagnosi());
        diarioClinico.setTrattamentoTerapia(dto.getTrattamentoTerapia());
        diarioClinico.setNote(dto.getNote());
        diarioClinico.setNotePrivate(dto.getNotePrivate());

        DiarioClinico updated = diarioClinicoService.updateDiarioClinico(id, diarioClinico);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteDiarioClinico(@PathVariable @NonNull Long id) {
        diarioClinicoService.deleteDiarioClinico(id);
        return ResponseEntity.noContent().build();
    }
}