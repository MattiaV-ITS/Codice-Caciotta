package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VisitaSchedaMapper;
import it.codicecaciotta.iltuoveterinario.services.VisitaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class VisitaSchedaController {

    private final VisitaService visitaService;

    public VisitaSchedaController(VisitaService visitaService) {
        this.visitaService = visitaService;
    }

    @GetMapping("/api/visite/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<VisitaSchedaDTO>> getVisiteByAnimaleId(@PathVariable Long animaleId) {
        List<VisitaSchedaDTO> visiteDTO = visitaService.getVisiteByAnimaleId(animaleId)
                .stream()
                .map(VisitaSchedaMapper::toSchedaDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(visiteDTO);
    }

    @GetMapping("/api/visite/{visitaId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<VisitaSchedaDTO> getVisitaById(@PathVariable Long visitaId) {
        VisitaSchedaDTO visitaDTO = VisitaSchedaMapper.toSchedaDTO(visitaService.getVisitaById(visitaId));
        return ResponseEntity.ok(visitaDTO);
    }
}