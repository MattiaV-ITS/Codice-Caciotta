package it.codicecaciotta.iltuoveterinario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DashboardStatsDTO {
    private long visiteOggi;
    private long prenotazioniTotali;
    private long fattureNonPagate;
    private BigDecimal importoNonPagato;
    private long animaliTotali;
    private long proprietariTotali;
    private long proprietariAttivi;
    private long animaliVaccinazioniScadute;
    private List<VisitaOggiDTO> visiteOggiList;
}
