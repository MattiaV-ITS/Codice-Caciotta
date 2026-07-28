package it.codicecaciotta.iltuoveterinario.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;

public interface AnimaleListaService {
    Page<AnimaleListaDTO> getAllAnimali(Pageable pageable);
    Page<AnimaleListaDTO> getAnimaliBySpecie(String specie, Pageable pageable);
    Page<AnimaleListaDTO> getAnimaliByStato(String stato, Pageable pageable);
    Page<AnimaleListaDTO> searchAnimaliComprehensive(String searchTerm, Pageable pageable);
    Page<AnimaleListaDTO> getAnimaliByProprietarioId(Long proprietarioId, Pageable pageable);
    Page<AnimaleListaDTO> searchAnimaliByProprietario(Long proprietarioId, String searchTerm, Pageable pageable);
    
    // NUOVO METODO UNIFICATO
    Page<AnimaleListaDTO> getAnimaliByFilters(String search, String specie, String stato, Long proprietarioId, Pageable pageable);
}