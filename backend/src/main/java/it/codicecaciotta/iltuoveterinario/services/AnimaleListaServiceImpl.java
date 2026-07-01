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
        return animaleRepository.findBySpecie(specie, pageable)
                .map(AnimaleListaMapper::toListaDTO);
    }


    // TODO: Implementare un metodo per ottenere gli animali di un proprietario specifico
}