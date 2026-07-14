package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import java.math.BigDecimal;
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
    private final DiarioClinicoService diarioClinicoService;

    public VisitaServiceImpl(VisitaRepository visitaRepository, AnimaleRepository animaleRepository,
            PrenotazioneRepository prenotazioneRepository, DiarioClinicoService diarioClinicoService) {
        this.visitaRepository = visitaRepository;
        this.animaleRepository = animaleRepository;
        this.prenotazioneRepository = prenotazioneRepository;
        this.diarioClinicoService = diarioClinicoService;
    }

    @Override
    @Transactional
    public Visita createVisitaScheda(@NonNull Long animaleId, VisitaSchedaCreateDTO dto) {
        // Create and save Visita
        Visita visita = new Visita();
        visita.setDataOraVisita(dto.getDataOraVisita());
        visita.setTipoVisita(dto.getTipoVisita());
        visita.setDataOraFineVisita(dto.getDataOraFineVisita());
        visita.setImportoTotale(dto.getImportoTotale() != null ? dto.getImportoTotale() : BigDecimal.ZERO);

        Animale animale = animaleRepository.findById(animaleId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Animale not found with id: " + animaleId));
        visita.setAnimale(animale);

        Visita savedVisita = visitaRepository.save(Objects.requireNonNull(visita));

        // Create and save DiarioClinico
        DiarioClinico diarioClinico = new DiarioClinico();
        diarioClinico.setSintomi(dto.getSintomi());
        diarioClinico.setDiagnosi(dto.getDiagnosi());
        diarioClinico.setTrattamentoTerapia(dto.getTrattamentoTerapia());
        diarioClinico.setNote(dto.getNote());
        diarioClinico.setNotePrivate(dto.getNotePrivate());
        diarioClinico.setVisita(savedVisita);

        diarioClinicoService.createDiarioClinico(diarioClinico);

        return savedVisita;
    }

    @Override
    @Transactional
    public Visita updateVisitaScheda(Long id, VisitaSchedaUpdateDTO dto) {
        if (id == null) {
            throw new IllegalArgumentException("Visita ID cannot be null");
        }
        // Update Visita
        Visita visita = visitaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Visita not found with id: " + id));

        if (dto.getDataOraVisita() != null) {
            visita.setDataOraVisita(dto.getDataOraVisita());
        }
        if (dto.getDataOraFineVisita() != null) {
            visita.setDataOraFineVisita(dto.getDataOraFineVisita());
        }
        if (dto.getTipoVisita() != null) {
            visita.setTipoVisita(dto.getTipoVisita());
        }
        if (dto.getImportoTotale() != null) {
            visita.setImportoTotale(dto.getImportoTotale());
        }
        
        Visita savedVisita = visitaRepository.save(visita);

        // Update or create DiarioClinico
        DiarioClinico diarioClinico = savedVisita.getDiarioClinico();
        if (diarioClinico == null) {
            diarioClinico = new DiarioClinico();
            diarioClinico.setVisita(savedVisita);
        }
        
        if (dto.getSintomi() != null) {
            diarioClinico.setSintomi(dto.getSintomi());
        }
        if (dto.getDiagnosi() != null) {
            diarioClinico.setDiagnosi(dto.getDiagnosi());
        }
        if (dto.getTrattamentoTerapia() != null) {
            diarioClinico.setTrattamentoTerapia(dto.getTrattamentoTerapia());
        }
        if (dto.getNote() != null) {
            diarioClinico.setNote(dto.getNote());
        }
        if (dto.getNotePrivate() != null) {
            diarioClinico.setNotePrivate(dto.getNotePrivate());
        }
        
        if (diarioClinico.getId() == null) {
            diarioClinicoService.createDiarioClinico(diarioClinico);
        } else {
            diarioClinicoService.updateDiarioClinico(diarioClinico.getId(), diarioClinico);
        }
        
        return savedVisita;
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
        return visitaRepository.findById(visitaId)
                .orElseThrow(() -> new EntityNotFoundException("Visita not found with id: " + visitaId));
    }

    @Override
    public List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId) {
        return visitaRepository.findByAnimaleId(animaleId);
    }
}