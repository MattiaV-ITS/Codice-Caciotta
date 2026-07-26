package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.Fattura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FatturaRepository extends JpaRepository<Fattura, Long> {
    Optional<Fattura> findByNumeroFattura(String numeroFattura);
    List<Fattura> findByVisitaId(Long visitaId);

    long countByPagata(boolean pagata);

    @Query("SELECT COALESCE(SUM(f.importoTotale), 0) FROM Fattura f WHERE f.pagata = :pagata")
    BigDecimal sumImportoTotaleByPagata(@Param("pagata") boolean pagata);

    @Query("SELECT COALESCE(SUM(f.importoTotale), 0) FROM Fattura f")
    BigDecimal sumImportoTotale();

    @Query("SELECT YEAR(f.dataEmissione) as anno, MONTH(f.dataEmissione) as mese, " +
           "COUNT(f) as totale, " +
           "SUM(CASE WHEN f.pagata = true THEN 1 ELSE 0 END) as pagate, " +
           "SUM(CASE WHEN f.pagata = false THEN 1 ELSE 0 END) as nonPagate, " +
           "COALESCE(SUM(f.importoTotale), 0) as importoTotale " +
           "FROM Fattura f " +
           "GROUP BY YEAR(f.dataEmissione), MONTH(f.dataEmissione) " +
           "ORDER BY anno DESC, mese DESC")
    List<Object[]> getFattureMensili();
}