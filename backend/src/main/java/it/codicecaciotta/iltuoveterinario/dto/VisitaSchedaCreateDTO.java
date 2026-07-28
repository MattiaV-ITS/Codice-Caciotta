package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO per la creazione di una nuova visita con diario clinico.
 */
@Data
public class VisitaSchedaCreateDTO {

    @NotNull(message = "Data e ora della visita non possono essere nulle")
    private LocalDateTime dataOraVisita;

    private LocalDateTime dataOraFineVisita;

    private String tipoVisita;

    private Long prenotazioneId;

    // Dati clinici (per DiarioClinico)
    private String sintomi;
    private String diagnosi;
    private String trattamentoTerapia;
    private String note;
    private String notePrivate;
}
