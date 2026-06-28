package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Animale;

public interface AnimaleRepository extends JpaRepository<Animale, Long> {

}
