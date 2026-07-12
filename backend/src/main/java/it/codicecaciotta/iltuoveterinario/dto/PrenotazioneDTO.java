package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PrenotazioneDTO {
    private Long id;
    private LocalDateTime dataPrenotazione;
    
    @NotNull(message = "Data e ora appuntamento non possono essere nulli")
    private LocalDateTime dataOraAppuntamento;
    
    @NotNull(message = "Tipo visita non può essere nullo")
    private String tipoVisita;
    
    private String note;
    
    @NotNull(message = "ID animale non può essere nullo")
    private Long animaleId;
    
    private String animaleNome;
    
    @NotNull(message = "ID proprietario non può essere nullo")
    private Long proprietarioId;
    
    private String proprietarioNome;
    private String proprietarioCognome;

}