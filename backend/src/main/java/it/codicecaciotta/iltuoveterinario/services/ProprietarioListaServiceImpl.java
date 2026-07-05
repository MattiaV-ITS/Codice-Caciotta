package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;
import it.codicecaciotta.iltuoveterinario.mapper.ProprietarioListaMapper;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


@Service
public class ProprietarioListaServiceImpl implements ProprietarioListaService {

    private final ProprietarioRepository proprietarioRepository;

    public ProprietarioListaServiceImpl(ProprietarioRepository proprietarioRepository) {
        this.proprietarioRepository = proprietarioRepository;
    }

    @Override
    public Page<ProprietarioListaDTO> getAllProprietari(Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        return proprietarioRepository.findAll(pageable)
                .map(ProprietarioListaMapper::toListaDTO);
    }

    @Override
    public Page<ProprietarioListaDTO> searchProprietariComprehensive(String searchTerm, Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        return proprietarioRepository.findByNomeContainingIgnoreCaseOrCognomeContainingIgnoreCaseOrTelefonoContainingIgnoreCaseOrEmailContainingIgnoreCaseOrCodiceFiscaleContainingIgnoreCase(
                searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, pageable)
                .map(ProprietarioListaMapper::toListaDTO);
    }

    @Override
    public Page<ProprietarioListaDTO> getProprietariByCitta(String citta, Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        return proprietarioRepository.findByCitta(citta, pageable)
                .map(ProprietarioListaMapper::toListaDTO);
    }
    
    @Override
    public Page<ProprietarioListaDTO> getProprietariByStato(Boolean stato, Pageable pageable) {
        if (pageable == null) {
            throw new IllegalArgumentException("Pageable cannot be null");
        }
        return proprietarioRepository.findByStato(stato, pageable)
                .map(ProprietarioListaMapper::toListaDTO);
    }
}