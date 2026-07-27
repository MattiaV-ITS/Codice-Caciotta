package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.mappers.AnimaleListaMapper;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnimaleListaServiceImpl implements AnimaleListaService {

    private final AnimaleRepository animaleRepository;

    public AnimaleListaServiceImpl(AnimaleRepository animaleRepository) {
        this.animaleRepository = animaleRepository;
    }

    // ---------- Metodi esistenti (mantenuti) ----------
    @Override
    public Page<AnimaleListaDTO> getAllAnimali(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable parameter cannot be null");
        }
        return animaleRepository.findAll(pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> getAnimaliByStato(String stato, Pageable pageable) {
        return animaleRepository.findByStato(stato, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> getAnimaliBySpecie(String specie, Pageable pageable) {
        if ("altro".equalsIgnoreCase(specie)) {
            return animaleRepository.findBySpecieNotInIgnoreCase(List.of("cane", "gatto"), pageable)
                    .map(AnimaleListaMapper::toListaDTO);
        }
        return animaleRepository.findBySpecieIgnoreCase(specie, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> searchAnimaliComprehensive(String searchTerm, Pageable pageable) {
        return animaleRepository.searchComprehensive(searchTerm, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> getAnimaliByProprietarioId(Long proprietarioId, Pageable pageable) {
        return animaleRepository.findByProprietarioId(proprietarioId, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> searchAnimaliByProprietario(Long proprietarioId, String searchTerm, Pageable pageable) {
        return animaleRepository.searchByProprietario(proprietarioId, searchTerm, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    // ---------- NUOVO METODO UNIFICATO ----------
    @Override
    public Page<AnimaleListaDTO> getAnimaliByFilters(
            String search, String specie, String stato, Long proprietarioId, Pageable pageable) {

        Specification<Animale> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Ricerca testuale (nome, microchip, proprietario.nome, proprietario.cognome)
            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("nome")), pattern),
                        cb.like(cb.lower(root.get("microchip")), pattern),
                        cb.like(cb.lower(root.join("proprietario").get("nome")), pattern),
                        cb.like(cb.lower(root.join("proprietario").get("cognome")), pattern)
                );
                predicates.add(searchPredicate);
            }

            // Filtro specie (case insensitive)
            if (specie != null && !specie.isBlank()) {
                if ("altro".equalsIgnoreCase(specie)) {
                    Predicate notCane = cb.notEqual(cb.lower(root.get("specie")), "cane");
                    Predicate notGatto = cb.notEqual(cb.lower(root.get("specie")), "gatto");
                    predicates.add(cb.and(notCane, notGatto));
                } else {
                    predicates.add(cb.equal(cb.lower(root.get("specie")), specie.toLowerCase()));
                }
            }

            // Filtro stato salute (esatto)
            if (stato != null && !stato.isBlank()) {
                predicates.add(cb.equal(root.get("stato"), stato));
            }

            // Filtro per proprietario
            if (proprietarioId != null) {
                predicates.add(cb.equal(root.get("proprietario").get("id"), proprietarioId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Animale> page = animaleRepository.findAll(spec, pageable);
        return page.map(AnimaleListaMapper::toListaDTO);
    }
}