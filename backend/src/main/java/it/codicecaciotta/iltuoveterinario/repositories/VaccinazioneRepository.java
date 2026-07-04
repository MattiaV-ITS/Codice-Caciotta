package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.EVaccinationStatus;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinazioneRepository extends JpaRepository<Vaccinazione, Long> {
    
    // Trova tutte le vaccinazioni per un animale specifico
    List<Vaccinazione> findByAnimale(Animale animale);
    
    // Trova tutte le vaccinazioni per un animale specifico ordinate per data di scadenza
    List<Vaccinazione> findByAnimaleOrderByDataScadenzaAsc(Animale animale);
    
    // Trova tutte le vaccinazioni scadute
    List<Vaccinazione> findByStato(EVaccinationStatus stato);
    
    // Trova tutte le vaccinazioni che scadono entro una certa data
    List<Vaccinazione> findByDataScadenzaBefore(LocalDate data);
    
    // Trova tutte le vaccinazioni per un animale che scadono entro una certa data
    List<Vaccinazione> findByAnimaleAndDataScadenzaBefore(Animale animale, LocalDate data);
    
    // Trova tutte le vaccinazioni per tipo
    List<Vaccinazione> findByTipoVaccino(String tipoVaccino);
    
    // Trova tutte le vaccinazioni per un animale e tipo specifico
    List<Vaccinazione> findByAnimaleAndTipoVaccino(Animale animale, String tipoVaccino);
}