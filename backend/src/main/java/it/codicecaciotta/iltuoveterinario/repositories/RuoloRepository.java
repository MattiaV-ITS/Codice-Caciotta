package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RuoloRepository extends JpaRepository<Ruolo, Integer> {
    // Trova il ruolo partendo dall'enum (es. ERuoli.ROLE_ADMIN)
    Optional<Ruolo> findByNome(ERuoli nome);
}
