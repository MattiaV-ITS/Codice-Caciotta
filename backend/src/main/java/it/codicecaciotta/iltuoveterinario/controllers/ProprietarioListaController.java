package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;
import it.codicecaciotta.iltuoveterinario.services.ProprietarioListaServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/proprietari")
public class ProprietarioListaController {

    private final ProprietarioListaServiceImpl proprietarioService;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String[] ALLOWED_SORT_FIELDS = {"id", "nome", "cognome", "email", "telefono", "citta"};

    public ProprietarioListaController(ProprietarioListaServiceImpl proprietarioService) {
        this.proprietarioService = proprietarioService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public Page<ProprietarioListaDTO> getProprietari(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String citta,
        @RequestParam(required = false) Boolean stato) {
        
        // Validate and sanitize pagination parameters
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            size = 10;
        }
        
        // Validate sortBy to prevent injection
        boolean validField = false;
        for (String field : ALLOWED_SORT_FIELDS) {
            if (field.equals(sortBy)) {
                validField = true;
                break;
            }
        }
        if (!validField) {
            sortBy = "id";
        }
        
        // Normalize sort direction
        sortDir = sortDir.toLowerCase().startsWith("desc") ? "desc" : "asc";
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        if (search != null && !search.trim().isEmpty()) {
            return proprietarioService.searchProprietariComprehensive(search.trim(), pageable);
        }
        
        if (citta != null && !citta.trim().isEmpty()) {
            return proprietarioService.getProprietariByCitta(citta.trim(), pageable);
        }
        
        // Check for stato parameter (Boolean) - status filtering
        if (stato != null) {
            return proprietarioService.getProprietariByStato(stato, pageable);
        }
        
        return proprietarioService.getAllProprietari(pageable);
    }
}
