package it.codicecaciotta.iltuoveterinario.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Utente;

public interface UtenteRepository extends JpaRepository<Utente, Long> {
  Optional<Utente> findByUsername(String username);

  Boolean existsByUsername(String username);

  Boolean existsByEmail(String email);
}