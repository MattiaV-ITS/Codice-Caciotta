package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.services.AnimaleListaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AnimaleListaController {

    private final AnimaleListaService animaleService;

    public AnimaleListaController(AnimaleListaService animaleService) {
        this.animaleService = animaleService;
    }

    @GetMapping("/api/animali")
    public List<AnimaleListaDTO> getAnimali() {
        return animaleService.getAllAnimali();
    }
}