package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PrestazioneServiceImpl implements PrestazioneService {

    @Autowired
    private PrestazioneRepository prestazioneRepository;

    @Override
    public List<Prestazione> getAllPrestazioni() {
        return prestazioneRepository.findAll();
    }

    @Override
    public Optional<Prestazione> getPrestazioneById(Long id) {
        return prestazioneRepository.findById(id);
    }

    @Override
    public Prestazione createPrestazione(Prestazione prestazione) {
        return prestazioneRepository.save(prestazione);
    }

    @Override
    public Prestazione updatePrestazione(Long id, Prestazione prestazione) {
        prestazione.setId(id);
        return prestazioneRepository.save(prestazione);
    }

    @Override
    public void deletePrestazione(Long id) {
        prestazioneRepository.deleteById(id);
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
                .map(Prestazione::getCategoria)
                .distinct()
                .collect(Collectors.toList());
    }
}