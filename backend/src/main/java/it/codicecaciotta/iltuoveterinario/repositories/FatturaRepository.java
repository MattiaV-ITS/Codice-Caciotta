package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Fattura;

public interface FatturaRepository extends JpaRepository<Fattura, Long> {

}
