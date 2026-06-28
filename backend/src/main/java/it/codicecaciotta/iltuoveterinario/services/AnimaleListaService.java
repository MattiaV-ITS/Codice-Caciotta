package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.mapper.AnimaleListaMapper;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnimaleListaService {

    private final AnimaleRepository animaleRepository;

    public AnimaleListaService(AnimaleRepository animaleRepository) {
        this.animaleRepository = animaleRepository;
    }

    public List<AnimaleListaDTO> getAllAnimali() {
        List<Animale> animali = animaleRepository.findAll();

        return animali.stream()
                .map(animale -> AnimaleListaMapper.toListaDTO(animale))
                .collect(Collectors.toList());
    }
}