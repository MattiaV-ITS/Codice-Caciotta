package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;
import it.codicecaciotta.iltuoveterinario.services.ProprietarioListaServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProprietarioListaController {

    private final ProprietarioListaServiceImpl proprietarioService;

    public ProprietarioListaController(ProprietarioListaServiceImpl proprietarioService) {
        this.proprietarioService = proprietarioService;
    }

    @GetMapping("/api/proprietari")
    public Page<ProprietarioListaDTO> getProprietari(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String citta) {
        
        sortDir = sortDir.equalsIgnoreCase("asc") ? "asc" : "desc"; // Default to ascending if invalid
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        if (search != null && !search.isEmpty()) {
            return proprietarioService.searchProprietariComprehensive(search, pageable);
        }
        
        if (citta != null && !citta.isEmpty()) {
            return proprietarioService.getProprietariByCitta(citta, pageable);
        }
        
        return proprietarioService.getAllProprietari(pageable);
    }
}