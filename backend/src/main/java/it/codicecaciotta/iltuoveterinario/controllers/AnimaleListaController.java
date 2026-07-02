package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.services.AnimaleListaServiceImpl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnimaleListaController {

    private final AnimaleListaServiceImpl animaleService;

    public AnimaleListaController(AnimaleListaServiceImpl animaleService) {
        this.animaleService = animaleService;
    }

    @GetMapping("/api/animali")
    public Page<AnimaleListaDTO> getAnimali(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String specie) {
        
        sortDir = sortDir.equalsIgnoreCase("asc") ? "asc" : "desc"; // Imposta asc come predefinito se non valido
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        if (search != null && !search.isEmpty()) {
            return animaleService.searchAnimaliComprehensive(search, pageable);
        }
        
        if (specie != null && !specie.isEmpty()) {
            return animaleService.getAnimaliBySpecie(specie, pageable);
        }
        
        return animaleService.getAllAnimali(pageable);
    }
}