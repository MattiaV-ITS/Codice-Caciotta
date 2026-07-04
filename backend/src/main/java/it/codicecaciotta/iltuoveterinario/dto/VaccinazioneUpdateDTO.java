package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.EVaccinationStatus;
import lombok.Data;

/**
 * DTO per aggiornamento di una vaccinazione. Contiene i campi che possono essere aggiornati.
 */
@Data
public class VaccinazioneUpdateDTO {

    private String tipoVaccino;

    private LocalDate dataSomministrazione;

    private LocalDate dataScadenza;

    private String lotto;

    private EVaccinationStatus stato;

    private String note;
}