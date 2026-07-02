package it.codicecaciotta.iltuoveterinario.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import it.codicecaciotta.iltuoveterinario.models.Proprietario;

public interface ProprietarioRepository extends JpaRepository<Proprietario, Long> {

}
