package it.codicecaciotta.iltuoveterinario.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;

public interface RuoloRepository extends JpaRepository<Ruolo, Long> {
    Optional<Ruolo> findByNome(ERuoli nome);
}
