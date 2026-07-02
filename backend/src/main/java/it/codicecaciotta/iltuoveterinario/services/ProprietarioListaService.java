package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProprietarioListaService {
    Page<ProprietarioListaDTO> getAllProprietari(Pageable pageable);
    Page<ProprietarioListaDTO> searchProprietariComprehensive(String searchTerm, Pageable pageable);
    Page<ProprietarioListaDTO> getProprietariByCitta(String citta, Pageable pageable);
}