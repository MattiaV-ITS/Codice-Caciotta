package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.EVaccinationStatus;
import lombok.Data;

/**
 * DTO per visualizzazione in lista delle vaccinazioni.
 */
@Data
public class VaccinazioneListaDTO {

    private Long id;

    private String tipoVaccino;

    private LocalDate dataScadenza;

    private EVaccinationStatus stato;

    private String nomeAnimale;

    private Long animaleId;
}