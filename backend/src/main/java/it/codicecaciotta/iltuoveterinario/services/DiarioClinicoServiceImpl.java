package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import it.codicecaciotta.iltuoveterinario.repositories.DiarioClinicoRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.Objects;

@Service
public class DiarioClinicoServiceImpl implements DiarioClinicoService {

    private final DiarioClinicoRepository diarioClinicoRepository;

    public DiarioClinicoServiceImpl(DiarioClinicoRepository diarioClinicoRepository) {
        this.diarioClinicoRepository = diarioClinicoRepository;
    }

    @Override
    public DiarioClinico getDiarioClinicoById(@NonNull Long id) {
        return diarioClinicoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Diario Clinico not found with id: " + id));
    }

    @Override
    public DiarioClinico getDiarioClinicoByVisitaId(@NonNull Long visitaId) {
        return diarioClinicoRepository.findByVisitaId(visitaId)
                .orElseThrow(() -> new EntityNotFoundException("Diario Clinico not found for visita id: " + visitaId));
    }

    @Override
    @Transactional
    public DiarioClinico createDiarioClinico(DiarioClinico diarioClinico) {
        return diarioClinicoRepository.save(Objects.requireNonNull(diarioClinico));
    }

    @Override
    @Transactional
    public DiarioClinico updateDiarioClinico(@NonNull Long id, DiarioClinico diarioClinico) {
        DiarioClinico existingDiario = Objects.requireNonNull(getDiarioClinicoById(id));
        
        // Update fields
        if (diarioClinico.getSintomi() != null) {
            existingDiario.setSintomi(diarioClinico.getSintomi());
        }
        if (diarioClinico.getDiagnosi() != null) {
            existingDiario.setDiagnosi(diarioClinico.getDiagnosi());
        }
        if (diarioClinico.getTrattamentoTerapia() != null) {
            existingDiario.setTrattamentoTerapia(diarioClinico.getTrattamentoTerapia());
        }
        if (diarioClinico.getNote() != null) {
            existingDiario.setNote(diarioClinico.getNote());
        }
        if (diarioClinico.getNotePrivate() != null) {
            existingDiario.setNotePrivate(diarioClinico.getNotePrivate());
        }
        if (diarioClinico.getVisita() != null) {
            existingDiario.setVisita(diarioClinico.getVisita());
        }
        
        return diarioClinicoRepository.save(Objects.requireNonNull(existingDiario));
    }

    @Override
    @Transactional
    public void deleteDiarioClinico(@NonNull Long id) {
        if (!diarioClinicoRepository.existsById(id)) {
            throw new EntityNotFoundException("Diario Clinico not found with id: " + id);
        }
        diarioClinicoRepository.deleteById(id);
    }
}