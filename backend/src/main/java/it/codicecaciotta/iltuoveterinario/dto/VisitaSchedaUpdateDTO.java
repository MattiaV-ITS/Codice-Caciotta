package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * DTO per update di una visita con diario clinico.
 * Tutti i campi sono opzionali.
 */
@Data
public class VisitaSchedaUpdateDTO {
    // Dati Visita
    private LocalDateTime dataOraVisita;

    private LocalDateTime dataOraFineVisita;

    private String tipoVisita;

    private BigDecimal importoTotale;

    // Dati clinici (per DiarioClinico)
    private String sintomi;
    private String diagnosi;
    private String trattamentoTerapia;
    private String note;
    private String notePrivate;
}