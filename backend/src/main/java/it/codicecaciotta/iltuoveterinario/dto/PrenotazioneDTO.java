package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDateTime;

import lombok.Data;

/**
 * DTO per la prenotazione - utilizzato per le risposte dell'API
 */
@Data
public class PrenotazioneDTO {
    private Long id;
    private LocalDateTime dataPrenotazione;
    private LocalDateTime dataOraAppuntamento;
    private String tipoVisita;
    private String note;
    
    // Animale fields
    private Long animaleId;
    private String animaleNome;
    
    // Stato prenotazione
    private String stato;
    
    // Proprietario fields
    private Long proprietarioId;
    private String proprietarioNome;
    private String proprietarioCognome;
}
