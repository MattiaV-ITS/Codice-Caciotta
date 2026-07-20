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
        return prestazioneRepository.save(Objects.requireNonNull(prestazione, "prestazione must not be null"));
    }

    @Override
    public Prestazione updatePrestazione(Long id, Prestazione prestazione) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        prestazione.setId(safeId);
        return prestazioneRepository.save(prestazione);
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

    @Override
    public List<String> getCategoriePrestazioni() {
        return prestazioneRepository.findAll().stream()
                .map(prestazione -> prestazione.getCategoria())
                .distinct()
                .collect(Collectors.toList());
    }
}