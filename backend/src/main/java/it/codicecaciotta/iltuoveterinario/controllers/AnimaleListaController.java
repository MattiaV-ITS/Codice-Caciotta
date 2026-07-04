package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.services.AnimaleListaServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnimaleListaController {

    private final AnimaleListaServiceImpl animaleService;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String[] ALLOWED_SORT_FIELDS = {"id", "nome", "specie", "dataNascita", "peso", "stato"};

    public AnimaleListaController(AnimaleListaServiceImpl animaleService) {
        this.animaleService = animaleService;
    }

    @GetMapping("/api/animali")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public Page<AnimaleListaDTO> getAnimali(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String specie) {
        
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
            return animaleService.searchAnimaliComprehensive(search.trim(), pageable);
        }
        
        if (specie != null && !specie.trim().isEmpty()) {
            return animaleService.getAnimaliBySpecie(specie.trim(), pageable);
        }
        
        return animaleService.getAllAnimali(pageable);
    }
}
