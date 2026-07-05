package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.services.AnimaleService;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/animali")
public class AnimaleController {

    private final AnimaleService animaleService;

    public AnimaleController(AnimaleService animaleService) {
        this.animaleService = animaleService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Animale> createAnimale(@Valid @RequestBody AnimaleCreateDTO animaleCreateDTO) {
        Animale createdAnimale = animaleService.createAnimale(animaleCreateDTO);
        
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdAnimale.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdAnimale);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Animale> updateAnimale(@PathVariable @NonNull Long id, @Valid @RequestBody AnimaleUpdateDTO animaleUpdateDTO) {
        Animale updatedAnimale = animaleService.updateAnimale(id, animaleUpdateDTO);
        return ResponseEntity.ok(updatedAnimale);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAnimale(@PathVariable @NonNull Long id) {
        animaleService.deleteAnimale(id);
        return ResponseEntity.noContent().build();
    }
}