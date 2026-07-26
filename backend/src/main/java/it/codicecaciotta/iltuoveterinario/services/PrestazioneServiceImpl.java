package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrestazioneServiceImpl implements PrestazioneService {

    private final PrestazioneRepository prestazioneRepository;

    public PrestazioneServiceImpl(PrestazioneRepository prestazioneRepository) {
        this.prestazioneRepository = prestazioneRepository;
    }

    @Override
    public List<Prestazione> getAllPrestazioni() {
        return prestazioneRepository.findAll();
    }

    @Override
    public Optional<Prestazione> getPrestazioneById(Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        return prestazioneRepository.findById(safeId);
    }

    @Override
    public Prestazione createPrestazione(Prestazione prestazione) {
        validatePrestazioneDuration(prestazione);
        return prestazioneRepository.save(prestazione);
    }

    @Override
    public Prestazione updatePrestazione(Long id, Prestazione prestazione) {
        prestazione.setId(id);
        validatePrestazioneDuration(prestazione);
        return prestazioneRepository.save(prestazione);
    }

    private void validatePrestazioneDuration(Prestazione prestazione) {
        if (prestazione.getDurataStimata() != null) {
            // Ensure duration is a multiple of 30 minutes
            if (prestazione.getDurataStimata() % 30 != 0) {
                throw new IllegalArgumentException("La durata stimata deve essere un multiplo di 30 minuti");
            }
        }
    }

    @Override
    public void deletePrestazione(Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        prestazioneRepository.deleteById(safeId);
    }

    @Override
    public List<Prestazione> getPrestazioniDisponibili() {
        return prestazioneRepository.findAll().stream()
                .filter(p -> "Disponibile".equals(p.getStato()))
                .collect(Collectors.toList());
    }

}