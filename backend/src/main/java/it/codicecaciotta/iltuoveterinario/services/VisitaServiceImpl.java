package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrenotazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class VisitaServiceImpl implements VisitaService {

    private final VisitaRepository visitaRepository;
    private final AnimaleRepository animaleRepository;
    private final PrenotazioneRepository prenotazioneRepository;

    public VisitaServiceImpl(VisitaRepository visitaRepository, AnimaleRepository animaleRepository,
            PrenotazioneRepository prenotazioneRepository) {
        this.visitaRepository = visitaRepository;
        this.animaleRepository = animaleRepository;
        this.prenotazioneRepository = prenotazioneRepository;
    }

    @Override
    @Transactional
    public Visita createVisita(@NonNull Long animaleId, VisitaCreateDTO dto) {
        // Create
        Visita visita = new Visita();
        visita.setDataOraVisita(dto.getDataOraVisita());
        visita.setDurata(dto.getDurata());
        visita.setImportoTotale(dto.getImportoTotale());

        Long prenotazioneId = Objects.requireNonNull(dto.getPrenotazioneId(),
                "Prenotazione ID cannot be null");
        Prenotazione prenotazione = prenotazioneRepository.findById(prenotazioneId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Prenotazione not found with id: " + prenotazioneId));
        visita.setPrenotazione(prenotazione);

        Animale animale = animaleRepository.findById(animaleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Animale not found with id: " + animaleId));
        visita.setAnimale(animale);

        // Save
        return visitaRepository.save(visita);
    }

    @Override
    @Transactional
    public Visita updateVisita(@NonNull Long id, VisitaUpdateDTO dto) {
        Visita visita = visitaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Visita not found with id: " + id));
        // Campi non-nullabili: se presenti, aggiorna
        if (dto.getDataOraVisita() != null) {
            visita.setDataOraVisita(dto.getDataOraVisita());
        }
        if (dto.getDurata() != null) {
            visita.setDurata(dto.getDurata());
        }
        if (dto.getImportoTotale() != null) {
            visita.setImportoTotale(dto.getImportoTotale());
        }
        // Save
        return visitaRepository.save(visita);
    }

    @Override
    @Transactional
    public void deleteVisita(@NonNull Long id) {
        if (!visitaRepository.existsById(id)) {
            throw new EntityNotFoundException("Visita not found with id: " + id);
        }
        visitaRepository.deleteById(id);
    }

    @Override
    public Visita getVisitaById(@NonNull Long visitaId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getVisitaById'");
    }

    @Override
    public List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getVisiteByAnimaleId'");
    }
}