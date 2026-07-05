package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinazioneRepository extends JpaRepository<Vaccinazione, Long> {
    
    List<Vaccinazione> findByAnimale(Animale animale);
    
    List<Vaccinazione> findByAnimaleOrderByDataScadenzaAsc(Animale animale);
    
    List<Vaccinazione> findByDataScadenzaBefore(LocalDate data);
    
    List<Vaccinazione> findByAnimaleAndDataScadenzaBefore(Animale animale, LocalDate data);
    
    List<Vaccinazione> findByTipoVaccino(String tipoVaccino);
    
    List<Vaccinazione> findByAnimaleAndTipoVaccino(Animale animale, String tipoVaccino);
}