package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {
    // Cerca per codice fiscale (utile per evitare duplicati)
    Optional<Proprietario> findByCodiceFiscale(String codiceFiscale);
    
    // Cerca per email
    Optional<Proprietario> findByEmail(String email);
}