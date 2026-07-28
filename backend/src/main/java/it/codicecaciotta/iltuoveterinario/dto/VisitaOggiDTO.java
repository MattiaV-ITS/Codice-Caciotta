package it.codicecaciotta.iltuoveterinario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class VisitaOggiDTO {
    private Long id;
    private String animaleNome;
    private String proprietarioNome;
    private String proprietarioCognome;
    private LocalDateTime dataOraAppuntamento;
    private String tipoVisita;
    private String stato;
}