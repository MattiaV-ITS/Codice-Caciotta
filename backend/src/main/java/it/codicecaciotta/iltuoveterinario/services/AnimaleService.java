package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;

import org.springframework.lang.NonNull;

public interface AnimaleService {
    Animale createAnimale(AnimaleCreateDTO animaleCreateDTO);
    Animale updateAnimale(@NonNull Long id, AnimaleUpdateDTO animaleUpdateDTO);
    void deleteAnimale(@NonNull Long id);
}