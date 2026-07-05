package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.services.ProprietarioService;

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
@RequestMapping("/api/proprietari")
public class ProprietarioController {

    private final ProprietarioService proprietarioService;

    public ProprietarioController(ProprietarioService proprietarioService) {
        this.proprietarioService = proprietarioService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Proprietario> createProprietario(@Valid @RequestBody ProprietarioCreateDTO proprietarioCreateDTO) {
        Proprietario createdProprietario = proprietarioService.createProprietario(proprietarioCreateDTO);
        
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdProprietario.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdProprietario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Proprietario> updateProprietario(@PathVariable @NonNull Long id, @Valid @RequestBody ProprietarioUpdateDTO proprietarioUpdateDTO) {
        Proprietario updatedProprietario = proprietarioService.updateProprietario(id, proprietarioUpdateDTO);
        return ResponseEntity.ok(updatedProprietario);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProprietario(@PathVariable Long id) {
        proprietarioService.deleteProprietario(id);
        return ResponseEntity.noContent().build();
    }
}