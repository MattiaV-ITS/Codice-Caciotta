package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PrestazioneService {

    List<Prestazione> getAllPrestazioni();

    Optional<Prestazione> getPrestazioneById(Long id);

    Prestazione createPrestazione(Prestazione prestazione);

    Prestazione updatePrestazione(Long id, Prestazione prestazione);

    void deletePrestazione(Long id);

    List<Prestazione> getPrestazioniDisponibili();

    // Nuovo metodo per ricerca e filtro
    Page<Prestazione> findByFilters(String search, Boolean stato, Pageable pageable);
}