package it.codicecaciotta.iltuoveterinario.services;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;

public interface AnimaleListaService {
    public Page<AnimaleListaDTO> getAllAnimali(Pageable pageable);
    public Page<AnimaleListaDTO> getAnimaliBySpecie(String specie, Pageable pageable);
    public Page<AnimaleListaDTO> getAnimaliByStato(String stato, Pageable pageable);
    
    // Metodo di ricerca completa
    public Page<AnimaleListaDTO> searchAnimaliComprehensive(String searchTerm, Pageable pageable);
}
