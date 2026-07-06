package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import lombok.Data;

/**
 * DTO per update parziale di un proprietario. Tutti i campi sono opzionali.
 */
@Data
public class VisitaUpdateDTO {
    // Visita
    @JsonSetter(nulls = Nulls.FAIL)
    private LocalDateTime dataOraVisita;

    private Integer durata;

    @JsonSetter(nulls = Nulls.FAIL)
    private BigDecimal importoTotale;
}
