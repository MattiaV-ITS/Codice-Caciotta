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
        @RequestParam(defaultValue = "asc") String sortDir) {
        sortDir = sortDir.equalsIgnoreCase("asc") ? "asc" : "desc"; // Default to ascending if invalid
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return animaleService.getAllAnimali(pageable);
    }
}