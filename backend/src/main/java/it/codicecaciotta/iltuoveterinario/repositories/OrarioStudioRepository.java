package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.EGiornoSettimana;
import it.codicecaciotta.iltuoveterinario.models.OrarioStudio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrarioStudioRepository extends JpaRepository<OrarioStudio, Long> {

    // Find default hours by day of week
    Optional<OrarioStudio> findByGiornoSettimanaAndIsDefaultTrue(EGiornoSettimana giornoSettimana);

    // Find all default hours
    List<OrarioStudio> findByIsDefaultTrueOrderByGiornoSettimana();

    // Find specific date overrides
    Optional<OrarioStudio> findByDataSpecifica(LocalDate dataSpecifica);

    // Find all specific date overrides
    List<OrarioStudio> findByIsDefaultFalseOrderByDataSpecifica();

    // Find specific date overrides in a date range
    @Query("SELECT o FROM OrarioStudio o WHERE o.isDefault = false AND o.dataSpecifica BETWEEN :startDate AND :endDate ORDER BY o.dataSpecifica")
    List<OrarioStudio> findSpecificHoursInDateRange(LocalDate startDate, LocalDate endDate);

    // Check if any default hours exist
    boolean existsByIsDefaultTrue();
}