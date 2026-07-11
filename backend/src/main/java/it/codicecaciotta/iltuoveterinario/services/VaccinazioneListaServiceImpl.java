package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.mappers.VaccinazioneListaMapper;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;

import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
public class VaccinazioneListaServiceImpl implements VaccinazioneListaService {

    private final VaccinazioneRepository vaccinazioneRepository;
    private final VaccinazioneListaMapper vaccinazioneListaMapper;

    public VaccinazioneListaServiceImpl(
            VaccinazioneRepository vaccinazioneRepository,
            VaccinazioneListaMapper vaccinazioneListaMapper) {

        this.vaccinazioneRepository = vaccinazioneRepository;
        this.vaccinazioneListaMapper = vaccinazioneListaMapper;
    }

    @Override
    public Page<VaccinazioneListaDTO> getAllVaccinazioni(@NonNull Pageable pageable) {
        return vaccinazioneRepository.findAll(pageable)
                .map(vaccinazioneListaMapper::toListaDTO);
    }

    @Override
    public Page<VaccinazioneListaDTO> searchVaccinazioni(String search, @NonNull Pageable pageable) {
        return vaccinazioneRepository.searchComprehensive(search, pageable)
                .map(vaccinazioneListaMapper::toListaDTO);
    }

    @Override
    public Page<VaccinazioneListaDTO> getVaccinazioniByStato(String stato, @NonNull Pageable pageable) {

        Page<Vaccinazione> paginatedResults = vaccinazioneRepository.findByStato(stato.toUpperCase(), pageable);

        List<VaccinazioneListaDTO> filtrate = paginatedResults.getContent().stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .toList();

        return new PageImpl<>(Objects.requireNonNull(filtrate), Objects.requireNonNull(pageable), paginatedResults.getTotalElements());
    }

    @Override
    public Page<VaccinazioneListaDTO> getVaccinazioniByAnimale(Long animaleId, @NonNull Pageable pageable) {
        return vaccinazioneRepository.findByAnimaleId(animaleId, pageable)
                .map(vaccinazioneListaMapper::toListaDTO);
    }
}
