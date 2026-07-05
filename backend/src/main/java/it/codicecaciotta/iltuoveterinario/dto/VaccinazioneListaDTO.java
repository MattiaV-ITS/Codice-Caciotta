package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.EStatoVaccinazione;
import lombok.Data;

/**
 * DTO per visualizzazione in lista delle vaccinazioni.
 */
@Data
public class VaccinazioneListaDTO {

    private Long id;

    private String lotto;

    private String tipoVaccino;

    private LocalDate dataSomministrazione;

    private LocalDate dataScadenza;

    private EStatoVaccinazione statoVaccinazione;

    private String nomeAnimale;

    private Long animaleId;
}