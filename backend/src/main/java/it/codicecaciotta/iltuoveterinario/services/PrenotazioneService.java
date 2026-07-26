package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.DiarioClinicoRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrenotazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import it.codicecaciotta.iltuoveterinario.services.OrarioBloccatoService;
import it.codicecaciotta.iltuoveterinario.services.OrarioStudioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PrenotazioneService {

    private static final Logger logger = LoggerFactory.getLogger(PrenotazioneService.class);

    private final PrenotazioneRepository prenotazioneRepository;

    private final VisitaRepository visitaRepository;

    private final DiarioClinicoRepository diarioClinicoRepository;

    private final OrarioStudioService orarioStudioService;

    private final OrarioBloccatoService orarioBloccatoService;

    private final PrestazioneRepository prestazioneRepository;

    PrenotazioneService(PrenotazioneRepository prenotazioneRepository, VisitaRepository visitaRepository, DiarioClinicoRepository diarioClinicoRepository, OrarioStudioService orarioStudioService, OrarioBloccatoService orarioBloccatoService, PrestazioneRepository prestazioneRepository) {
        this.prenotazioneRepository = prenotazioneRepository;
        this.visitaRepository = visitaRepository;
        this.diarioClinicoRepository = diarioClinicoRepository;
        this.orarioStudioService = orarioStudioService;
        this.orarioBloccatoService = orarioBloccatoService;
        this.prestazioneRepository = prestazioneRepository;
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getAllPrenotazioni() {
        return prenotazioneRepository.findAllWithRelationships();
    }

    @Transactional(readOnly = true)
    public Optional<Prenotazione> getPrenotazioneById(Long id) {
        return prenotazioneRepository.findByIdWithRelationships(id);
    }

    @Transactional
    public Prenotazione createPrenotazione(Prenotazione prenotazione) {
        prenotazione.setDataPrenotazione(LocalDateTime.now());

        // Validate appointment time against studio hours and blocked times
        validateAppointmentTime(prenotazione);

        // Check for double booking
        checkForDoubleBooking(prenotazione);

        return prenotazioneRepository.save(prenotazione);
    }

    private void validateAppointmentTime(Prenotazione prenotazione) {
        LocalDateTime appointmentTime = prenotazione.getDataOraAppuntamento();
        if (appointmentTime == null) {
            throw new IllegalArgumentException("Appointment time cannot be null");
        }

        LocalDate appointmentDate = appointmentTime.toLocalDate();
        LocalTime appointmentTimeOfDay = appointmentTime.toLocalTime();

        logger.debug("Validating appointment: date={}, time={}", appointmentDate, appointmentTimeOfDay);

        // Check if studio is closed on this day
        var studioHours = orarioStudioService.getOrarioForDate(appointmentDate);
        if (studioHours.isEmpty() || Boolean.TRUE.equals(studioHours.get().getChiuso())) {
            logger.error("Studio is closed on {}", appointmentDate.getDayOfWeek());
            throw new IllegalArgumentException("Studio is closed on " + appointmentDate.getDayOfWeek());
        }

        var orarioStudio = studioHours.get();

        // Check if appointment is outside opening hours
        LocalTime openingTime = orarioStudio.getOraApertura();
        LocalTime closingTime = orarioStudio.getOraChiusura();

        if (appointmentTimeOfDay.isBefore(openingTime) || appointmentTimeOfDay.isAfter(closingTime) ||
            appointmentTimeOfDay.equals(closingTime)) {
            logger.error("Appointment outside hours: {} not in [{}, {}]", appointmentTimeOfDay, openingTime, closingTime);
            throw new IllegalArgumentException("Appointment time is outside studio opening hours. " +
                "Studio is open from " + openingTime + " to " + closingTime);
        }

        // Check if appointment is during lunch break
        if (orarioStudio.getOraInizioPausaPranzo() != null && orarioStudio.getOraFinePausaPranzo() != null) {
            LocalTime lunchStart = orarioStudio.getOraInizioPausaPranzo();
            LocalTime lunchEnd = orarioStudio.getOraFinePausaPranzo();

            if ((appointmentTimeOfDay.isAfter(lunchStart) || appointmentTimeOfDay.equals(lunchStart)) &&
                appointmentTimeOfDay.isBefore(lunchEnd)) {
                logger.error("Appointment during lunch: {} in [{}, {}]", appointmentTimeOfDay, lunchStart, lunchEnd);
                throw new IllegalArgumentException("Appointment time is during lunch break. " +
                    "Lunch break is from " + lunchStart + " to " + lunchEnd);
            }
        }

        // Check if appointment time is blocked
        var blockedTimes = orarioBloccatoService.getOrariBloccatiByData(appointmentDate);
        for (var blockedTime : blockedTimes) {
            LocalTime blockedStart = blockedTime.getOraInizio();
            LocalTime blockedEnd = blockedTime.getOraFine();

            if ((appointmentTimeOfDay.isAfter(blockedStart) || appointmentTimeOfDay.equals(blockedStart)) &&
                appointmentTimeOfDay.isBefore(blockedEnd)) {
                logger.error("Appointment in blocked time: {} in [{}, {}]", appointmentTimeOfDay, blockedStart, blockedEnd);
                throw new IllegalArgumentException("Appointment time is blocked. " +
                    "Blocked time: " + blockedStart + " to " + blockedEnd +
                    (blockedTime.getMotivo() != null ? " (" + blockedTime.getMotivo() + ")" : ""));
            }
        }
        logger.debug("Appointment validation passed");
    }

    private void checkForDoubleBooking(Prenotazione prenotazione) {
        LocalDateTime appointmentTime = prenotazione.getDataOraAppuntamento();
        if (appointmentTime == null) {
            throw new IllegalArgumentException("Appointment time cannot be null");
        }

        logger.debug("Checking double booking for prenotazione: id={}, animal={}, proprietario={}", 
            prenotazione.getId(), 
            prenotazione.getAnimale() != null ? prenotazione.getAnimale().getId() : "null",
            prenotazione.getProprietario() != null ? prenotazione.getProprietario().getId() : "null");

        // Get the duration of the appointment based on the prestazione
        int appointmentDuration = getAppointmentDuration(prenotazione);
        LocalDateTime appointmentEndTime = appointmentTime.plusMinutes(appointmentDuration);

        // Check if the same animal already has an appointment at the same time
        List<Prenotazione> existingAppointments = prenotazioneRepository.findByAnimaleId(prenotazione.getAnimale().getId());

        for (Prenotazione existing : existingAppointments) {
            if (existing.getId() != null && existing.getId().equals(prenotazione.getId())) {
                continue; // Skip the same appointment if updating
            }

            LocalDateTime existingTime = existing.getDataOraAppuntamento();
            if (existingTime != null) {
                int existingDuration = getAppointmentDuration(existing);
                LocalDateTime existingEndTime = existingTime.plusMinutes(existingDuration);

                // Check for time overlap
                if (appointmentTime.isBefore(existingEndTime) && appointmentEndTime.isAfter(existingTime)) {
                    logger.error("Double booking detected for animal: {} has appointment from {} to {}", 
                        prenotazione.getAnimale().getNome(), existingTime, existingEndTime);
                    throw new IllegalArgumentException("Double booking detected. " +
                        "Animal " + prenotazione.getAnimale().getNome() +
                        " already has an appointment from " + existingTime + " to " + existingEndTime);
                }
            }
        }

        // Check if the same proprietario already has an appointment at the same time
        List<Prenotazione> existingProprietarioAppointments = prenotazioneRepository.findByProprietarioId(prenotazione.getProprietario().getId());

        for (Prenotazione existing : existingProprietarioAppointments) {
            if (existing.getId() != null && existing.getId().equals(prenotazione.getId())) {
                continue; // Skip the same appointment if updating
            }

            LocalDateTime existingTime = existing.getDataOraAppuntamento();
            if (existingTime != null) {
                int existingDuration = getAppointmentDuration(existing);
                LocalDateTime existingEndTime = existingTime.plusMinutes(existingDuration);

                // Check for time overlap
                if (appointmentTime.isBefore(existingEndTime) && appointmentEndTime.isAfter(existingTime)) {
                    logger.error("Double booking detected for proprietario: {} has appointment from {} to {}", 
                        prenotazione.getProprietario().getNome(), existingTime, existingEndTime);
                    throw new IllegalArgumentException("Double booking detected. " +
                        "Proprietario " + prenotazione.getProprietario().getNome() + " " + prenotazione.getProprietario().getCognome() +
                        " already has an appointment from " + existingTime + " to " + existingEndTime);
                }
            }
        }
        logger.debug("Double booking check passed");
    }

    private int getAppointmentDuration(Prenotazione prenotazione) {
        // Default duration if no prestazione is specified
        if (prenotazione.getTipoVisita() == null || prenotazione.getTipoVisita().equals("Altro")) {
            return 30; // Default 30 minutes
        }

        // Find the prestazione by name
        Optional<Prestazione> prestazioneOptional = prestazioneRepository.findByNomePrestazione(prenotazione.getTipoVisita());
        return prestazioneOptional.map(prestazione -> prestazione.getDurataStimata() != null ? prestazione.getDurataStimata() : 30)
                .orElse(30); // Default 30 minutes if prestazione not found
    }

    @Transactional
    public Prenotazione updatePrenotazione(Long id, Prenotazione prenotazioneDetails) {
        Long prenotazioneId = Objects.requireNonNull(id, "Prenotazione id cannot be null");
        logger.info("Starting update of prenotazione {}", prenotazioneId);
        return prenotazioneRepository.findById(prenotazioneId)
                .map(prenotazione -> {
                    logger.debug("Found prenotazione {}, updating fields", prenotazioneId);
                    prenotazione.setDataOraAppuntamento(prenotazioneDetails.getDataOraAppuntamento());
                    prenotazione.setTipoVisita(prenotazioneDetails.getTipoVisita());
                    prenotazione.setNote(prenotazioneDetails.getNote());
                    prenotazione.setAnimale(prenotazioneDetails.getAnimale());
                    prenotazione.setProprietario(prenotazioneDetails.getProprietario());
                    
                    logger.debug("Validating updated prenotazione");
                    validateAppointmentTime(prenotazione);
                    
                    logger.debug("Checking for double bookings");
                    checkForDoubleBooking(prenotazione);
                    
                    logger.info("Saving updated prenotazione {}", prenotazioneId);
                    return prenotazioneRepository.save(prenotazione);
                })
                .orElseThrow(() -> new RuntimeException("Prenotazione not found with id: " + prenotazioneId));
    }

    @Transactional
    public void deletePrenotazione(Long id) {
        Long prenotazioneId = Objects.requireNonNull(id, "Prenotazione id cannot be null");
        logger.info("Attempting to delete prenotazione with ID: {}", prenotazioneId);

        // Check if the prenotazione exists and has an associated visita
        Optional<Prenotazione> prenotazioneOptional = prenotazioneRepository.findByIdWithRelationships(prenotazioneId);
        if (prenotazioneOptional.isPresent()) {
            Prenotazione prenotazione = prenotazioneOptional.get();

            // Check if there's an associated visita - if so, prevent deletion
            if (prenotazione.getVisita() != null) {
                Visita visita = prenotazione.getVisita();
                logger.warn("Cannot delete prenotazione with ID {} - it has an associated visita with ID: {}", prenotazioneId, visita.getId());
                throw new IllegalStateException("Cannot delete prenotazione that has an associated visita. Please delete the visita first.");
            }

            // If no visita exists, proceed with deletion
            logger.info("No associated visita found, proceeding with deletion of prenotazione with ID: {}", prenotazioneId);
            prenotazioneRepository.deleteById(prenotazioneId);
            logger.info("Successfully deleted prenotazione with ID: {}", prenotazioneId);
        } else {
            logger.warn("Attempted to delete non-existent prenotazione with ID: {}", prenotazioneId);
            throw new RuntimeException("Prenotazione not found with id: " + prenotazioneId);
        }
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByAnimale(Long animaleId) {
        return prenotazioneRepository.findByAnimaleId(animaleId);
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByProprietario(Long proprietarioId) {
        return prenotazioneRepository.findByProprietarioId(proprietarioId);
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByDateRange(String startDate, String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        return prenotazioneRepository.findByDataOraAppuntamentoBetween(start, end);
    }

    @Transactional
    public Optional<Visita> createVisitaFromPrenotazione(Long prenotazioneId) {
        return prenotazioneRepository.findByIdWithRelationships(prenotazioneId)
                .map(prenotazione -> {
                    // Check if visita already exists
                    if (prenotazione.getVisita() != null) {
                        return prenotazione.getVisita();
                    }

                    // Create new visita from prenotazione
                    Visita visita = new Visita();
                    visita.setDataOraVisita(prenotazione.getDataOraAppuntamento());
                    visita.setTipoVisita(prenotazione.getTipoVisita());
                    visita.setAnimale(prenotazione.getAnimale());
                    visita.setPrenotazione(prenotazione);
                    visita.setImportoTotale(java.math.BigDecimal.ZERO);
                    visita.setDurata(30); // Default duration

                    Visita savedVisita = visitaRepository.save(visita);
                    
                    // Create and save DiarioClinico for the visita
                    DiarioClinico diarioClinico = new DiarioClinico();
                    diarioClinico.setVisita(savedVisita);
                    diarioClinico.setSintomi(""); // Empty default values
                    diarioClinico.setDiagnosi("");
                    diarioClinico.setTrattamentoTerapia("");
                    diarioClinico.setNote("");
                    diarioClinico.setNotePrivate("");
                    diarioClinicoRepository.save(diarioClinico);

                    prenotazione.setVisita(savedVisita);
                    prenotazioneRepository.save(prenotazione);

                    return savedVisita;
                });
    }

    @Transactional(readOnly = true)
    public Optional<Visita> getVisitaForPrenotazione(Long prenotazioneId) {
        return prenotazioneRepository.findByIdWithRelationships(prenotazioneId)
                .map(prenotazione -> {
                    Visita visita = prenotazione.getVisita();
                    if (visita != null) {
                        visita.getId();
                    }
                    return visita;
                });
    }
}
