package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO per creazione di una prenotazione. Contiene i campi necessari per creare una nuova prenotazione nel sistema.
 */
@Data
public class PrenotazioneCreateDTO {

    @NotNull(message = "Data e ora appuntamento non possono essere nulli")
    private LocalDateTime dataOraAppuntamento;
    
    @NotNull(message = "Tipo visita non può essere nullo")
    private String tipoVisita;
    
    private String note;
    
    @NotNull(message = "ID animale non può essere nullo")
    private Long animaleId;
    
    @NotNull(message = "ID proprietario non può essere nullo")
    private Long proprietarioId;
    
    private String stato;
}