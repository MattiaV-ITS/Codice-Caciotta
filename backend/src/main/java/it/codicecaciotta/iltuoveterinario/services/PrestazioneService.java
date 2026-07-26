package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;

import java.util.List;
import java.util.Optional;

public interface PrestazioneService {
    List<Prestazione> getAllPrestazioni();
    Optional<Prestazione> getPrestazioneById(Long id);
    Prestazione createPrestazione(Prestazione prestazione);
    Prestazione updatePrestazione(Long id, Prestazione prestazione);
    void deletePrestazione(Long id);
    List<Prestazione> getPrestazioniDisponibili();
}
