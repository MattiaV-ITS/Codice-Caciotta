package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.repositories.DiarioClinicoRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrenotazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrenotazioneServiceTest {

    @Mock
    private PrenotazioneRepository prenotazioneRepository;

    @Mock
    private VisitaRepository visitaRepository;

    @Mock
    private DiarioClinicoRepository diarioClinicoRepository;

    @Mock
    private OrarioStudioService orarioStudioService;

    @Mock
    private OrarioBloccatoService orarioBloccatoService;

    @Mock
    private PrestazioneRepository prestazioneRepository;

    @InjectMocks
    private PrenotazioneService prenotazioneService;

    private Animale animale1;
    private Animale animale2;
    private Proprietario proprietario1;
    private Proprietario proprietario2;
    private Prestazione prestazione;

    @BeforeEach
    void setUp() {
        animale1 = new Animale();
        animale1.setId(1L);
        animale1.setNome("Fido");

        animale2 = new Animale();
        animale2.setId(2L);
        animale2.setNome("Rex");

        proprietario1 = new Proprietario();
        proprietario1.setId(1L);
        proprietario1.setNome("Mario");
        proprietario1.setCognome("Rossi");

        proprietario2 = new Proprietario();
        proprietario2.setId(2L);
        proprietario2.setNome("Luigi");
        proprietario2.setCognome("Verdi");

        prestazione = new Prestazione();
        prestazione.setId(1L);
        prestazione.setNomePrestazione("Visita di controllo");
        prestazione.setDurataStimata(120); // 2 hours

        when(prestazioneRepository.findByNomePrestazione(any())).thenReturn(Optional.of(prestazione));
    }

    @Test
    void testAppointmentOverlapDetection() {
        // Create an existing appointment from 16:00 to 18:00 (2 hours)
        Prenotazione existingAppointment = new Prenotazione();
        existingAppointment.setId(1L);
        existingAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 16, 0));
        existingAppointment.setTipoVisita("Visita di controllo");
        existingAppointment.setAnimale(animale1);
        existingAppointment.setProprietario(proprietario1);

        // Create a new appointment that would overlap (17:00 to 19:00)
        Prenotazione newAppointment = new Prenotazione();
        newAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 17, 0));
        newAppointment.setTipoVisita("Visita di controllo");
        newAppointment.setAnimale(animale2); // Different animal
        newAppointment.setProprietario(proprietario2); // Different owner

        // Mock the repository to return the existing appointment when searching for overlaps
        when(prenotazioneRepository.findByDataOraAppuntamentoBetween(any(), any()))
            .thenReturn(List.of(existingAppointment));

        // This should throw an exception due to time slot conflict
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            prenotazioneService.checkForDoubleBooking(newAppointment);
        });

        assertTrue(exception.getMessage().contains("Time slot conflict detected"));
    }

    @Test
    void testNoOverlapWhenAppointmentsAreSeparate() {
        // Create an existing appointment from 14:00 to 16:00 (2 hours)
        Prenotazione existingAppointment = new Prenotazione();
        existingAppointment.setId(1L);
        existingAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 14, 0));
        existingAppointment.setTipoVisita("Visita di controllo");
        existingAppointment.setAnimale(animale1);
        existingAppointment.setProprietario(proprietario1);

        // Create a new appointment that doesn't overlap (16:00 to 18:00)
        Prenotazione newAppointment = new Prenotazione();
        newAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 16, 0));
        newAppointment.setTipoVisita("Visita di controllo");
        newAppointment.setAnimale(animale2); // Different animal
        newAppointment.setProprietario(proprietario2); // Different owner

        // Mock the repository to return the existing appointment when searching for overlaps
        when(prenotazioneRepository.findByDataOraAppuntamentoBetween(any(), any()))
            .thenReturn(List.of(existingAppointment));

        // This should not throw an exception
        assertDoesNotThrow(() -> {
            prenotazioneService.checkForDoubleBooking(newAppointment);
        });
    }

    @Test
    void testSameAnimalDoubleBooking() {
        // Create an existing appointment for animal1
        Prenotazione existingAppointment = new Prenotazione();
        existingAppointment.setId(1L);
        existingAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 16, 0));
        existingAppointment.setTipoVisita("Visita di controllo");
        existingAppointment.setAnimale(animale1);
        existingAppointment.setProprietario(proprietario1);

        // Create a new appointment for the same animal at the same time
        Prenotazione newAppointment = new Prenotazione();
        newAppointment.setDataOraAppuntamento(LocalDateTime.of(2023, 1, 1, 16, 0));
        newAppointment.setTipoVisita("Visita di controllo");
        newAppointment.setAnimale(animale1); // Same animal
        newAppointment.setProprietario(proprietario1);

        // Mock the repository
        when(prenotazioneRepository.findByDataOraAppuntamentoBetween(any(), any()))
            .thenReturn(List.of());
        when(prenotazioneRepository.findByAnimaleId(anyLong()))
            .thenReturn(List.of(existingAppointment));

        // This should throw an exception due to same animal double booking
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            prenotazioneService.checkForDoubleBooking(newAppointment);
        });

        assertTrue(exception.getMessage().contains("Double booking detected"));
        assertTrue(exception.getMessage().contains("Animal"));
    }
}