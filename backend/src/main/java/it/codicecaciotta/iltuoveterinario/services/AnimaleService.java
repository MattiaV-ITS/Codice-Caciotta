package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import java.util.List;

import org.springframework.lang.NonNull;

public interface AnimaleService {
    Animale createAnimale(AnimaleCreateDTO animaleCreateDTO);
    Animale updateAnimale(@NonNull Long id, AnimaleUpdateDTO animaleUpdateDTO);
    void deleteAnimale(@NonNull Long id);
    
    // Metodo per ottenere un animale con le sue vaccinazioni
    Animale getAnimaleWithVaccinazioni(@NonNull Long id);
}