package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO per la creazione di una nuova visita.
 */
@Data
public class VisitaCreateDTO {

    @NotNull(message = "Data e ora della visita non possono essere nulle")
    private LocalDateTime dataOraVisita;

    private Integer durata;

    @NotNull(message = "Importo totale non può essere nullo")
    @DecimalMin(value = "0.0", inclusive = false, message = "Importo totale deve essere maggiore di zero")
    private BigDecimal importoTotale;

    private Long prenotazioneId;

    @NotNull(message = "ID animale non può essere nullo")
    private Long animaleId;

    private Long diarioClinicoId;
}
