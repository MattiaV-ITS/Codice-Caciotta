package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleSchedaDTO;
import it.codicecaciotta.iltuoveterinario.mapper.AnimaleSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.services.AnimaleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnimaleSchedaController {

    private final AnimaleService animaleService;

    public AnimaleSchedaController(AnimaleService animaleService) {
        this.animaleService = animaleService;
    }

    @GetMapping("/api/animali/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<AnimaleSchedaDTO> getAnimaleSchedaById(@PathVariable Long id) {
        Animale animale = animaleService.getAnimaleById(id);
        AnimaleSchedaDTO schedaDTO = AnimaleSchedaMapper.toSchedaDTO(animale);
        
        return ResponseEntity.ok(schedaDTO);
    }
}