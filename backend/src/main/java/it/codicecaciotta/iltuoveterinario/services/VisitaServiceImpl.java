package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VisitaSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;

@Service
public class VisitaServiceImpl implements VisitaService {

    private final VisitaRepository visitaRepository;

    public VisitaServiceImpl(VisitaRepository visitaRepository) {
        this.visitaRepository = visitaRepository;
    }

    @Override
    public List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId) {
        return visitaRepository.findByAnimaleId(animaleId);
    }

    @Override
    public Visita getVisitaById(@NonNull Long visitaId) {
        return visitaRepository.findById(visitaId)
                .orElseThrow(() -> new EntityNotFoundException("Visita not found with id: " + visitaId));
    }

    @Override
    @Transactional
    public Visita createVisita(@NonNull Visita visita) {
        return visitaRepository.save(visita);
    }

    @Override
    @Transactional
    public Visita updateVisita(@NonNull Long id, Visita visita) {
        Visita existingVisita = getVisitaById(id);
        
        // Update fields
        if (visita.getDataOraVisita() != null) {
            existingVisita.setDataOraVisita(visita.getDataOraVisita());
        }
        if (visita.getDurata() != null) {
            existingVisita.setDurata(visita.getDurata());
        }
        if (visita.getImportoTotale() != null) {
            existingVisita.setImportoTotale(visita.getImportoTotale());
        }
        if (visita.getPrenotazione() != null) {
            existingVisita.setPrenotazione(visita.getPrenotazione());
        }
        if (visita.getAnimale() != null) {
            existingVisita.setAnimale(visita.getAnimale());
        }
        
        return visitaRepository.save(existingVisita);
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
    public VisitaSchedaDTO getVisitaSchedaById(@NonNull Long id) {
        Visita visita = getVisitaById(id);
        return VisitaSchedaMapper.toSchedaDTO(visita);
    }
}