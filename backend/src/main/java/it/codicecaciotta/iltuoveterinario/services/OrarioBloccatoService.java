package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.EGiornoSettimana;
import it.codicecaciotta.iltuoveterinario.models.OrarioBloccato;
import it.codicecaciotta.iltuoveterinario.models.OrarioStudio;
import it.codicecaciotta.iltuoveterinario.repositories.OrarioBloccatoRepository;
import it.codicecaciotta.iltuoveterinario.repositories.OrarioStudioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class OrarioBloccatoService {

    private final OrarioBloccatoRepository orarioBloccatoRepository;
    private final OrarioStudioRepository orarioStudioRepository;

    public OrarioBloccatoService(OrarioBloccatoRepository orarioBloccatoRepository,
                               OrarioStudioRepository orarioStudioRepository) {
        this.orarioBloccatoRepository = orarioBloccatoRepository;
        this.orarioStudioRepository = orarioStudioRepository;
    }

    /**
     * Get all blocked time slots
     * @return List of all blocked time slots
     */
    @Transactional(readOnly = true)
    public List<OrarioBloccato> getAllOrariBloccati() {
        return orarioBloccatoRepository.findAllByOrderByDataAscOraInizioAsc();
    }

    /**
     * Get blocked time slots for a specific date
     * @param data The date to check
     * @return List of blocked time slots for the date
     */
    @Transactional(readOnly = true)
    public List<OrarioBloccato> getOrariBloccatiByData(LocalDate data) {
        LocalDate safeData = Objects.requireNonNull(data, "data must not be null");
        return orarioBloccatoRepository.findByData(safeData);
    }

    /**
     * Get blocked time slots within a date range
     * @param startDate Start date of range
     * @param endDate End date of range
     * @return List of blocked time slots in the range
     */
    @Transactional(readOnly = true)
    public List<OrarioBloccato> getOrariBloccatiInRange(LocalDate startDate, LocalDate endDate) {
        LocalDate safeStartDate = Objects.requireNonNull(startDate, "startDate must not be null");
        LocalDate safeEndDate = Objects.requireNonNull(endDate, "endDate must not be null");
        return orarioBloccatoRepository.findByDataBetween(safeStartDate, safeEndDate);
    }

    /**
     * Create a new blocked time slot
     * @param data Date of the blocked slot
     * @param oraInizio Start time of the blocked slot
     * @param oraFine End time of the blocked slot
     * @param motivo Reason for blocking (optional)
     * @param creatoDa User who created the block
     * @return Created OrarioBloccato
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public OrarioBloccato createOrarioBloccato(LocalDate data, LocalTime oraInizio, LocalTime oraFine,
                                             String motivo, String creatoDa) {
        // Validate the time slot
        LocalDate safeData = Objects.requireNonNull(data, "data must not be null");
        LocalTime safeOraInizio = Objects.requireNonNull(oraInizio, "oraInizio must not be null");
        LocalTime safeOraFine = Objects.requireNonNull(oraFine, "oraFine must not be null");
        validateTimeSlot(safeData, safeOraInizio, safeOraFine);

        // Check if this time slot overlaps with existing blocked slots
        List<OrarioBloccato> overlapping = orarioBloccatoRepository.findOverlappingBlockedTimes(safeData, safeOraInizio, safeOraFine);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Esiste già un orario bloccato che si sovrappone a questo slot");
        }

        // Check if the studio is even open on this date
        Optional<OrarioStudio> orarioStudio = getOrarioStudioForDate(safeData);
        if (orarioStudio.isPresent() && orarioStudio.get().getChiuso()) {
            throw new IllegalArgumentException("Lo studio è chiuso in questa data, non è necessario bloccare orari");
        }

        // Check if the blocked time is within studio open hours
        if (orarioStudio.isPresent() && !orarioStudio.get().getChiuso()) {
            LocalTime apertura = orarioStudio.get().getOraApertura();
            LocalTime chiusura = orarioStudio.get().getOraChiusura();

            if (safeOraInizio.isBefore(apertura) || safeOraFine.isAfter(chiusura)) {
                throw new IllegalArgumentException("L'orario bloccato deve essere all'interno degli orari di apertura dello studio (" +
                        apertura + " - " + chiusura + ")");
            }
        }

        OrarioBloccato blockedTime = OrarioBloccato.builder()
                .data(safeData)
                .oraInizio(safeOraInizio)
                .oraFine(safeOraFine)
                .motivo(motivo)
                .creatoDa(creatoDa)
                .build();

        return orarioBloccatoRepository.save(Objects.requireNonNull(blockedTime, "blockedTime must not be null"));
    }

    /**
     * Update an existing blocked time slot
     * @param id ID of the blocked time slot to update
     * @param data New date (optional, can be null to keep current)
     * @param oraInizio New start time
     * @param oraFine New end time
     * @param motivo New reason
     * @return Updated OrarioBloccato
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public OrarioBloccato updateOrarioBloccato(Long id, LocalDate data, LocalTime oraInizio, LocalTime oraFine, String motivo) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        OrarioBloccato existing = orarioBloccatoRepository.findById(safeId)
                .orElseThrow(() -> new IllegalArgumentException("Orario bloccato non trovato"));

        // Use existing data if not provided
        LocalDate targetData = data != null ? data : existing.getData();

        // Validate the time slot
        validateTimeSlot(targetData, oraInizio, oraFine);

        // Check for overlaps with other blocked slots (excluding itself)
        List<OrarioBloccato> overlapping = orarioBloccatoRepository.findOverlappingBlockedTimes(
            targetData, oraInizio, oraFine);
        if (!overlapping.isEmpty() && !overlapping.stream().anyMatch(o -> Objects.equals(o.getId(), safeId))) {
            throw new IllegalArgumentException("Esiste già un orario bloccato che si sovrappone a questo slot");
        }

        // Update the fields
        existing.setData(targetData);
        existing.setOraInizio(oraInizio);
        existing.setOraFine(oraFine);
        existing.setMotivo(motivo);

        return orarioBloccatoRepository.save(existing);
    }

    /**
     * Delete a blocked time slot
     * @param id ID of the blocked time slot to delete
     */
    @Transactional
    public void deleteOrarioBloccato(Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        if (!orarioBloccatoRepository.existsById(safeId)) {
            throw new IllegalArgumentException("Orario bloccato non trovato");
        }
        orarioBloccatoRepository.deleteById(safeId);
    }

    /**
     * Get studio hours for a specific date (checks specific overrides first, then defaults)
     */
    private Optional<OrarioStudio> getOrarioStudioForDate(LocalDate data) {
        LocalDate safeData = Objects.requireNonNull(data, "data must not be null");
        // First check for specific date override
        Optional<OrarioStudio> specificOrario = orarioStudioRepository.findByDataSpecifica(safeData);
        if (specificOrario.isPresent()) {
            return specificOrario;
        }

        // If no specific override, get default for day of week
        EGiornoSettimana giornoSettimana = convertDayOfWeekToGiornoSettimana(safeData.getDayOfWeek());
        return orarioStudioRepository.findByGiornoSettimanaAndIsDefaultTrue(giornoSettimana);
    }

    /**
     * Validate time slot parameters
     */
    private void validateTimeSlot(LocalDate data, LocalTime oraInizio, LocalTime oraFine) {
        if (data == null) {
            throw new IllegalArgumentException("La data è obbligatoria");
        }

        if (oraInizio == null) {
            throw new IllegalArgumentException("L'ora di inizio è obbligatoria");
        }

        if (oraFine == null) {
            throw new IllegalArgumentException("L'ora di fine è obbligatoria");
        }

        if (oraInizio.isAfter(oraFine)) {
            throw new IllegalArgumentException("L'ora di inizio deve essere prima dell'ora di fine");
        }

        if (oraInizio.equals(oraFine)) {
            throw new IllegalArgumentException("L'ora di inizio e fine non possono essere uguali");
        }

        // Check if the date is in the past
        if (data.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Non è possibile bloccare orari per date passate");
        }
    }

    /**
     * Convert DayOfWeek to EGiornoSettimana
     */
    private EGiornoSettimana convertDayOfWeekToGiornoSettimana(java.time.DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> EGiornoSettimana.LUNEDI;
            case TUESDAY -> EGiornoSettimana.MARTEDI;
            case WEDNESDAY -> EGiornoSettimana.MERCOLEDI;
            case THURSDAY -> EGiornoSettimana.GIOVEDI;
            case FRIDAY -> EGiornoSettimana.VENERDI;
            case SATURDAY -> EGiornoSettimana.SABATO;
            case SUNDAY -> EGiornoSettimana.DOMENICA;
        };
    }
}
