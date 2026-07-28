package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.EGiornoSettimana;
import it.codicecaciotta.iltuoveterinario.models.OrarioStudio;
import it.codicecaciotta.iltuoveterinario.repositories.OrarioStudioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class OrarioStudioService {

    private static final Logger logger = LoggerFactory.getLogger(OrarioStudioService.class);
    private final OrarioStudioRepository orarioStudioRepository;

    public OrarioStudioService(OrarioStudioRepository orarioStudioRepository) {
        this.orarioStudioRepository = orarioStudioRepository;
    }

    /**
     * Get studio hours for a specific date
     * @param date The date to check
     * @return OrarioStudio for the date (specific override or default)
     */
    @Transactional(readOnly = true)
    public Optional<OrarioStudio> getOrarioForDate(LocalDate date) {
        // First check for specific date override
        Optional<OrarioStudio> specificOrario = orarioStudioRepository.findByDataSpecifica(date);
        if (specificOrario.isPresent()) {
            return specificOrario;
        }

        // If no specific override, get default for day of week
        EGiornoSettimana giornoSettimana = convertDayOfWeekToGiornoSettimana(date.getDayOfWeek());
        return orarioStudioRepository.findByGiornoSettimanaAndIsDefaultTrue(giornoSettimana);
    }

    /**
     * Get all default weekly hours
     * @return List of default OrarioStudio entries
     */
    @Transactional(readOnly = true)
    public List<OrarioStudio> getAllDefaultOrari() {
        return orarioStudioRepository.findByIsDefaultTrueOrderByGiornoSettimana();
    }

    /**
     * Get all specific date overrides
     * @return List of specific OrarioStudio entries
     */
    @Transactional(readOnly = true)
    public List<OrarioStudio> getAllSpecificOrari() {
        return orarioStudioRepository.findByIsDefaultFalseOrderByDataSpecifica();
    }

    /**
     * Get specific date overrides within a date range
     * @param startDate Start date of range
     * @param endDate End date of range
     * @return List of specific OrarioStudio entries in range
     */
    @Transactional(readOnly = true)
    public List<OrarioStudio> getSpecificOrariInRange(LocalDate startDate, LocalDate endDate) {
        return orarioStudioRepository.findSpecificHoursInDateRange(startDate, endDate);
    }

    /**
     * Update default hours for a day of week
     * @param giornoSettimana Day of week
     * @param oraApertura Opening time
     * @param oraChiusura Closing time
     * @param chiuso Whether studio is closed
     * @return Updated OrarioStudio
     */
    @Transactional
    public OrarioStudio updateDefaultOrario(EGiornoSettimana giornoSettimana, LocalTime oraApertura, LocalTime oraChiusura, boolean chiuso) {
        logger.info("Updating default hours for {}: {}-{} ({})",
                giornoSettimana, oraApertura, oraChiusura, chiuso ? "closed" : "open");

        validateTimeRange(oraApertura, oraChiusura, chiuso);

        OrarioStudio orario = orarioStudioRepository.findByGiornoSettimanaAndIsDefaultTrue(giornoSettimana)
                .orElseGet(() -> OrarioStudio.builder()
                        .giornoSettimana(giornoSettimana)
                        .isDefault(true)
                        .build());

        logger.debug("Found existing orario: {}", orario);

        orario.setOraApertura(oraApertura);
        orario.setOraChiusura(oraChiusura);
        orario.setChiuso(chiuso);

        OrarioStudio saved = orarioStudioRepository.save(orario);
        logger.info("Successfully saved orario with ID: {}", saved.getId());

        return saved;
    }

    @Transactional
    public OrarioStudio updateDefaultOrarioWithLunchBreak(EGiornoSettimana giornoSettimana, LocalTime oraApertura, LocalTime oraChiusura,
                                                         LocalTime oraInizioPausaPranzo, LocalTime oraFinePausaPranzo, boolean chiuso) {
        logger.info("Updating default hours with lunch break for {}: {}-{} (lunch: {}-{}) ({})",
                giornoSettimana, oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo, chiuso ? "closed" : "open");

        validateTimeRange(oraApertura, oraChiusura, chiuso);
        validateLunchBreak(oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo);

        OrarioStudio orario = orarioStudioRepository.findByGiornoSettimanaAndIsDefaultTrue(giornoSettimana)
                .orElseGet(() -> OrarioStudio.builder()
                        .giornoSettimana(giornoSettimana)
                        .isDefault(true)
                        .build());

        logger.debug("Found existing orario: {}", orario);

        orario.setOraApertura(oraApertura);
        orario.setOraChiusura(oraChiusura);
        orario.setOraInizioPausaPranzo(oraInizioPausaPranzo);
        orario.setOraFinePausaPranzo(oraFinePausaPranzo);
        orario.setChiuso(chiuso);

        OrarioStudio saved = orarioStudioRepository.save(orario);
        logger.info("Successfully saved orario with lunch break with ID: {}", saved.getId());

        return saved;
    }

    /**
     * Add or update specific date override
     * @param date Specific date
     * @param oraApertura Opening time
     * @param oraChiusura Closing time
     * @param chiuso Whether studio is closed
     * @return Created/updated OrarioStudio
     */
    @Transactional
    public OrarioStudio addOrUpdateSpecificOrario(LocalDate date, LocalTime oraApertura, LocalTime oraChiusura, boolean chiuso) {
        validateTimeRange(oraApertura, oraChiusura, chiuso);

        OrarioStudio orario = orarioStudioRepository.findByDataSpecifica(date)
                .orElseGet(() -> OrarioStudio.builder()
                        .dataSpecifica(date)
                        .isDefault(false)
                        .build());

        orario.setOraApertura(oraApertura);
        orario.setOraChiusura(oraChiusura);
        orario.setChiuso(chiuso);
        orario.setGiornoSettimana(convertDayOfWeekToGiornoSettimana(date.getDayOfWeek()));

        return orarioStudioRepository.save(orario);
    }

    @Transactional
    public OrarioStudio addOrUpdateSpecificOrarioWithLunchBreak(LocalDate date, LocalTime oraApertura, LocalTime oraChiusura,
                                                               LocalTime oraInizioPausaPranzo, LocalTime oraFinePausaPranzo, boolean chiuso) {
        logger.info("Adding/updating specific date override with lunch break for {}: {}-{} (lunch: {}-{}) ({})",
                date, oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo, chiuso ? "closed" : "open");

        validateTimeRange(oraApertura, oraChiusura, chiuso);
        validateLunchBreak(oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo);

        OrarioStudio orario = orarioStudioRepository.findByDataSpecifica(date)
                .orElseGet(() -> OrarioStudio.builder()
                        .dataSpecifica(date)
                        .isDefault(false)
                        .build());

        orario.setOraApertura(oraApertura);
        orario.setOraChiusura(oraChiusura);
        orario.setOraInizioPausaPranzo(oraInizioPausaPranzo);
        orario.setOraFinePausaPranzo(oraFinePausaPranzo);
        orario.setChiuso(chiuso);
        orario.setGiornoSettimana(convertDayOfWeekToGiornoSettimana(date.getDayOfWeek()));

        OrarioStudio saved = orarioStudioRepository.save(orario);
        logger.info("Successfully saved specific date override with lunch break with ID: {}", saved.getId());

        return saved;
    }

    /**
     * Remove specific date override
     * @param id ID of the specific override to remove
     */
    @Transactional
    public void removeSpecificOrario(Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        orarioStudioRepository.deleteById(safeId);
    }

    /**
     * Initialize default hours if none exist
     */
    @Transactional
    public void initializeDefaultOrariIfNeeded() {
        if (orarioStudioRepository.existsByIsDefaultTrue()) {
            return;
        }

        // Create default hours: 9:00-18:00 Monday-Friday, closed Saturday-Sunday
        for (EGiornoSettimana giorno : EGiornoSettimana.values()) {
            OrarioStudio orario = OrarioStudio.builder()
                    .giornoSettimana(giorno)
                    .oraApertura(giorno == EGiornoSettimana.SABATO || giorno == EGiornoSettimana.DOMENICA ? null : LocalTime.of(9, 0))
                    .oraChiusura(giorno == EGiornoSettimana.SABATO || giorno == EGiornoSettimana.DOMENICA ? null : LocalTime.of(18, 0))
                    .chiuso(giorno == EGiornoSettimana.SABATO || giorno == EGiornoSettimana.DOMENICA)
                    .isDefault(true)
                    .build();

            orarioStudioRepository.save(Objects.requireNonNull(orario, "orario must not be null"));
        }
    }

    @Transactional
    public void updateAllDefaultOrari(LocalTime oraApertura, LocalTime oraChiusura,
                                    LocalTime oraInizioPausaPranzo, LocalTime oraFinePausaPranzo,
                                    boolean chiuso, Set<EGiornoSettimana> giorniEsclusi) {
        logger.info("Updating all default hours: {}-{} (lunch: {}-{}) excluding {} days",
                oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo, giorniEsclusi);

        validateTimeRange(oraApertura, oraChiusura, chiuso);
        validateLunchBreak(oraApertura, oraChiusura, oraInizioPausaPranzo, oraFinePausaPranzo);

        for (EGiornoSettimana giorno : EGiornoSettimana.values()) {
            if (giorniEsclusi != null && giorniEsclusi.contains(giorno)) {
                logger.debug("Skipping day {} as it's in the exclusion list", giorno);
                continue;
            }

            OrarioStudio orario = orarioStudioRepository.findByGiornoSettimanaAndIsDefaultTrue(giorno)
                    .orElseGet(() -> OrarioStudio.builder()
                            .giornoSettimana(giorno)
                            .isDefault(true)
                            .build());

            orario.setOraApertura(oraApertura);
            orario.setOraChiusura(oraChiusura);
            orario.setOraInizioPausaPranzo(oraInizioPausaPranzo);
            orario.setOraFinePausaPranzo(oraFinePausaPranzo);
            orario.setChiuso(chiuso);

            orarioStudioRepository.save(orario);
            logger.debug("Updated day {} with new hours", giorno);
        }

        logger.info("Successfully updated all default hours for non-excluded days");
    }

    /**
     * Validate time range
     */
    private void validateTimeRange(LocalTime oraApertura, LocalTime oraChiusura, boolean chiuso) {
        logger.debug("Validating time range: {}-{} ({})", oraApertura, oraChiusura, chiuso ? "closed" : "open");

        if (chiuso) {
            return; // No validation needed if closed
        }

        if (oraApertura == null || oraChiusura == null) {
            logger.error("Validation failed: Opening and closing times must be provided when studio is open");
            throw new IllegalArgumentException("Opening and closing times must be provided when studio is open");
        }

        if (oraApertura.isAfter(oraChiusura)) {
            logger.error("Validation failed: Opening time {} is after closing time {}", oraApertura, oraChiusura);
            throw new IllegalArgumentException("Opening time must be before closing time");
        }

        if (oraApertura.equals(oraChiusura)) {
            logger.error("Validation failed: Opening and closing times are the same: {}", oraApertura);
            throw new IllegalArgumentException("Opening and closing times cannot be the same");
        }

        logger.debug("Time range validation passed");
    }

    private void validateLunchBreak(LocalTime oraApertura, LocalTime oraChiusura,
                                 LocalTime oraInizioPausaPranzo, LocalTime oraFinePausaPranzo) {
        if (oraInizioPausaPranzo == null && oraFinePausaPranzo == null) {
            // No lunch break specified, that's fine
            return;
        }

        if (oraInizioPausaPranzo == null || oraFinePausaPranzo == null) {
            logger.error("Validation failed: Both lunch break start and end times must be provided");
            throw new IllegalArgumentException("Both lunch break start and end times must be provided");
        }

        if (oraInizioPausaPranzo.isAfter(oraFinePausaPranzo)) {
            logger.error("Validation failed: Lunch break start {} is after end {}", oraInizioPausaPranzo, oraFinePausaPranzo);
            throw new IllegalArgumentException("Lunch break start time must be before end time");
        }

        if (oraInizioPausaPranzo.equals(oraFinePausaPranzo)) {
            logger.error("Validation failed: Lunch break start and end times are the same: {}", oraInizioPausaPranzo);
            throw new IllegalArgumentException("Lunch break start and end times cannot be the same");
        }

        // Lunch break must be within open hours
        if (oraInizioPausaPranzo.isBefore(oraApertura)) {
            logger.error("Validation failed: Lunch break starts before opening time");
            throw new IllegalArgumentException("Lunch break cannot start before opening time");
        }

        if (oraFinePausaPranzo.isAfter(oraChiusura)) {
            logger.error("Validation failed: Lunch break ends after closing time");
            throw new IllegalArgumentException("Lunch break cannot end after closing time");
        }

        logger.debug("Lunch break validation passed: {}-{}", oraInizioPausaPranzo, oraFinePausaPranzo);
    }

    /**
     * Convert DayOfWeek to EGiornoSettimana
     */
    private EGiornoSettimana convertDayOfWeekToGiornoSettimana(DayOfWeek dayOfWeek) {
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