package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PrenotazioneRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PrenotazioneRepository prenotazioneRepository;

    @Test
    void whenFindByIdWithRelationships_thenVisitaShouldBeEagerlyLoaded() {
        // Create and persist a test prenotazione with a visita
        Prenotazione prenotazione = new Prenotazione();
        prenotazione.setDataOraAppuntamento(LocalDateTime.now().plusDays(1));
        prenotazione.setTipoVisita("Visita di controllo");
        prenotazione.setDataPrenotazione(LocalDateTime.now());

        Visita visita = new Visita();
        visita.setDataOraVisita(prenotazione.getDataOraAppuntamento());
        visita.setTipoVisita(prenotazione.getTipoVisita());
        visita.setPrenotazione(prenotazione);
        visita.setDurata(30);

        prenotazione.setVisita(visita);

        entityManager.persist(prenotazione);
        entityManager.flush();

        // Clear the persistence context to force a fresh load
        entityManager.clear();

        // Use the repository method that should eagerly load the visita
        Optional<Prenotazione> foundPrenotazione = prenotazioneRepository.findByIdWithRelationships(prenotazione.getId());

        assertThat(foundPrenotazione).isPresent();
        Prenotazione loadedPrenotazione = foundPrenotazione.get();
        
        // This should not throw a LazyInitializationException
        Visita loadedVisita = loadedPrenotazione.getVisita();
        assertThat(loadedVisita).isNotNull();
        assertThat(loadedVisita.getId()).isEqualTo(visita.getId());
    }

    @Test
    void whenFindByIdWithRelationships_thenShouldReturnEmptyForNonExistentId() {
        Optional<Prenotazione> foundPrenotazione = prenotazioneRepository.findByIdWithRelationships(9999L);
        assertThat(foundPrenotazione).isEmpty();
    }

    @Test
    void whenFindByIdWithRelationships_thenPrenotazioneWithoutVisitaShouldWork() {
        // Create and persist a test prenotazione without a visita
        Prenotazione prenotazione = new Prenotazione();
        prenotazione.setDataOraAppuntamento(LocalDateTime.now().plusDays(1));
        prenotazione.setTipoVisita("Visita di controllo");
        prenotazione.setDataPrenotazione(LocalDateTime.now());

        entityManager.persist(prenotazione);
        entityManager.flush();

        // Clear the persistence context to force a fresh load
        entityManager.clear();

        // Use the repository method that should eagerly load the visita (which should be null)
        Optional<Prenotazione> foundPrenotazione = prenotazioneRepository.findByIdWithRelationships(prenotazione.getId());

        assertThat(foundPrenotazione).isPresent();
        Prenotazione loadedPrenotazione = foundPrenotazione.get();
        
        // This should not throw a LazyInitializationException and should return null
        Visita loadedVisita = loadedPrenotazione.getVisita();
        assertThat(loadedVisita).isNull();
    }
}