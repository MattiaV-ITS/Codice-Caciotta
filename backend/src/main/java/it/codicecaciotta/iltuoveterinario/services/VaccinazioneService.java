package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.lang.NonNull;

import java.util.List;

public interface VaccinazioneService {
    Vaccinazione createVaccinazione(VaccinazioneCreateDTO vaccinazioneCreateDTO);
    Vaccinazione updateVaccinazione(@NonNull Long id, VaccinazioneUpdateDTO vaccinazioneUpdateDTO);
    void deleteVaccinazione(@NonNull Long id);
    Vaccinazione getVaccinazioneById(@NonNull Long id);
    List<Vaccinazione> getVaccinazioniByAnimaleId(@NonNull Long animaleId);
    List<Vaccinazione> getAllVaccinazioni();
    List<Vaccinazione> getVaccinazioniScadute();
    List<Vaccinazione> getVaccinazioniInScadenza();
}