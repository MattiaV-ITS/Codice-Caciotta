package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.mapper.AnimaleListaMapper;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
public class AnimaleListaServiceImpl implements AnimaleListaService {

    private final AnimaleRepository animaleRepository;

    public AnimaleListaServiceImpl(AnimaleRepository animaleRepository) {
        this.animaleRepository = animaleRepository;
    }

    @Override
    public Page<AnimaleListaDTO> getAllAnimali(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable non può essere null");
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
        // Gestione del caso "altro" - restituisce tutti gli animali che non sono cane o gatto
        if ("altro".equalsIgnoreCase(specie)) {
            return animaleRepository.findBySpecieNotInIgnoreCase(java.util.Arrays.asList("cane", "gatto"), pageable)
                    .map(AnimaleListaMapper::toListaDTO);
        }
        // Caso normale - filtra per specie specifica
        return animaleRepository.findBySpecieIgnoreCase(specie, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    @Override
    public Page<AnimaleListaDTO> searchAnimaliComprehensive(String searchTerm, Pageable pageable) {
        return animaleRepository.findByNomeContainingIgnoreCaseOrMicrochipContainingIgnoreCaseOrProprietario_NomeContainingIgnoreCaseOrProprietario_CognomeContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm, searchTerm, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }

    // TODO: Implementare un metodo per ottenere gli animali di un proprietario specifico
}