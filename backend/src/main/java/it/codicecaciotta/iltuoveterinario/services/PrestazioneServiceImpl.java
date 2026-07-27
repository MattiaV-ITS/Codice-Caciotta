package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
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
        Objects.requireNonNull(prestazione, "prestazione must not be null");
        validatePrestazioneDuration(prestazione);
        return prestazioneRepository.save(prestazione);
    }

    @Override
    public Prestazione updatePrestazione(Long id, Prestazione prestazione) {
        Objects.requireNonNull(prestazione, "prestazione must not be null");
        prestazione.setId(id);
        validatePrestazioneDuration(prestazione);
        return prestazioneRepository.save(prestazione);
    }

    private void validatePrestazioneDuration(Prestazione prestazione) {
        if (prestazione.getDurataStimata() != null) {
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
                .filter(p -> Boolean.TRUE.equals(p.getStato()))
                .collect(Collectors.toList());
    }

    @Override
    public Page<Prestazione> findByFilters(String search, Boolean stato, Pageable pageable) {
        Pageable safePageable = Objects.requireNonNull(pageable, "pageable must not be null");
        
        // Base: predicato sempre vero (nessuna condizione)
        Specification<Prestazione> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";

            Specification<Prestazione> textSpec = (root, query, cb) ->
                cb.or(
                    cb.like(cb.lower(root.get("nomePrestazione")), pattern),
                    cb.like(cb.lower(root.get("descrizione")), pattern)
                );

            // Tentativo di ricerca per costo esatto
            try {
                BigDecimal costoSearched = new BigDecimal(search);
                Specification<Prestazione> costSpec = (root, query, cb) ->
                    cb.equal(root.get("costoBase"), costoSearched);
                spec = spec.and(textSpec.or(costSpec));
            } catch (NumberFormatException e) {
                spec = spec.and(textSpec);
            }
        }

        if (stato != null) {
            Specification<Prestazione> statoSpec = (root, query, cb) ->
                cb.equal(root.get("stato"), stato);
            spec = spec.and(statoSpec);
        }

        return prestazioneRepository.findAll(spec, safePageable);
    }
}
