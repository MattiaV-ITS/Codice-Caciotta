package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VaccinazioneListaService {

    Page<VaccinazioneListaDTO> getAllVaccinazioni(Pageable pageable);

    Page<VaccinazioneListaDTO> searchVaccinazioni(String search, Pageable pageable);

    Page<VaccinazioneListaDTO> getVaccinazioniByStato(String stato, Pageable pageable);

    Page<VaccinazioneListaDTO> getVaccinazioniByAnimale(Long animaleId, Pageable pageable);
}
