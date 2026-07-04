package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.EVaccinationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO per creazione di una vaccinazione. Contiene i campi necessari per creare una nuova vaccinazione nel sistema.
 */
@Data
public class VaccinazioneCreateDTO {

    @NotNull(message = "Tipo vaccino non può essere nullo")
    private String tipoVaccino;

    @NotNull(message = "Data somministrazione non può essere nulla")
    private LocalDate dataSomministrazione;

    @NotNull(message = "Data scadenza non può essere nulla")
    private LocalDate dataScadenza;

    @NotNull(message = "Lotto non può essere nullo")
    private String lotto;

    @NotNull(message = "Stato non può essere nullo")
    private EVaccinationStatus stato;

    private String note;

    @NotNull(message = "ID animale non può essere nullo")
    private Long animaleId;
}