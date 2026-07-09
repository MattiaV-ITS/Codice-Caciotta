package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.services.ProprietarioListaServiceImpl;
import it.codicecaciotta.iltuoveterinario.services.ProprietarioService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/proprietari")
public class ProprietarioController {

    private final ProprietarioService proprietarioService;
    private final ProprietarioListaServiceImpl proprietarioListaService;
    private final PaginationAndSortingUtils paginationAndSortingUtils;

    public ProprietarioController(ProprietarioService proprietarioService,
            ProprietarioListaServiceImpl proprietarioListaService, PaginationAndSortingUtils paginationAndSortingUtils) {
        this.proprietarioService = proprietarioService;
        this.proprietarioListaService = proprietarioListaService;
        this.paginationAndSortingUtils = paginationAndSortingUtils;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Proprietario> createProprietario(
            @Valid @RequestBody ProprietarioCreateDTO proprietarioCreateDTO) {
        Proprietario createdProprietario = proprietarioService.createProprietario(proprietarioCreateDTO);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdProprietario.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdProprietario);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Proprietario> updateProprietario(@PathVariable @NonNull Long id,
            @Valid @RequestBody ProprietarioUpdateDTO proprietarioUpdateDTO) {
        Proprietario updatedProprietario = proprietarioService.updateProprietario(id, proprietarioUpdateDTO);
        return ResponseEntity.ok(updatedProprietario);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProprietario(@PathVariable @NonNull Long id) {
        proprietarioService.deleteProprietario(id);
        return ResponseEntity.noContent().build();
    }

    private static final List<String> ALLOWED_SORT_FIELDS = List.of("id", "nome", "cognome", "email", "telefono", "citta", "stato");

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public Page<ProprietarioListaDTO> getProprietari(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean stato) {

        Pageable pageable = paginationAndSortingUtils.buildPageRequest(
                page, size, sortBy, sortDir, ALLOWED_SORT_FIELDS);

        if (search != null && !search.trim().isEmpty()) {
            return proprietarioListaService.searchProprietariComprehensive(search.trim(), pageable);
        }


        if (stato != null) {
            return proprietarioListaService.getProprietariByStato(stato, pageable);
        }

        return proprietarioListaService.getAllProprietari(pageable);
    }
}