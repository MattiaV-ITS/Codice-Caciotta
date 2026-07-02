package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Animale;


public interface AnimaleRepository extends JpaRepository<Animale, Long> {
    Page<Animale> findBySpecie(String specie, Pageable pageable);
    Page<Animale> findByStato(String stato, Pageable pageable);
}
