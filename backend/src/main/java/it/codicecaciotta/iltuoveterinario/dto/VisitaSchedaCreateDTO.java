package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO per la creazione di una nuova visita con diario clinico.
 */
@Data
public class VisitaSchedaCreateDTO {

    @NotNull(message = "Data e ora della visita non possono essere nulle")
    private LocalDateTime dataOraVisita;

    private Integer durata;

    private String tipoVisita;

    @DecimalMin(value = "0.0", inclusive = false, message = "Importo totale deve essere maggiore di zero")
    private BigDecimal importoTotale;

    private Long prenotazioneId;

    // Dati clinici (per DiarioClinico)
    private String sintomi;
    private String diagnosi;
    private String trattamentoTerapia;
    private String note;
    private String notePrivate;
}