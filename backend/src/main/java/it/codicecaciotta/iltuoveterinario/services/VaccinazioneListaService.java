package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;

public interface VaccinazioneListaService {

    Page<VaccinazioneListaDTO> getAllVaccinazioni(@NonNull Pageable pageable);

    Page<VaccinazioneListaDTO> searchVaccinazioni(String search, @NonNull Pageable pageable);

    Page<VaccinazioneListaDTO> getVaccinazioniByStato(String stato, @NonNull Pageable pageable);

    Page<VaccinazioneListaDTO> getVaccinazioniByAnimale(Long animaleId, @NonNull Pageable pageable);
}
