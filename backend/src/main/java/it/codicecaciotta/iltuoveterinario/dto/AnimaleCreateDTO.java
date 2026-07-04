package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.ESesso;
import it.codicecaciotta.iltuoveterinario.models.EStatoAnimale;
import it.codicecaciotta.iltuoveterinario.models.ETaglia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO per creazione di un animale. Contiene i campi necessari per creare un nuovo animale nel sistema.
 */
@Data
public class AnimaleCreateDTO {

    @NotNull(message = "Nome non può essere nullo")
    private String nome;

    @NotNull(message = "Specie non può essere nullo")
    private String specie;

    private String razza;

    @NotNull(message = "Data di nascita non può essere nullo")
    private LocalDate dataNascita;

    private ESesso sesso;

    @NotNull(message = "Peso non può essere nullo")
    private BigDecimal peso;

    @Size(min = 15, max = 15, message = "Microchip deve avere esattamente 15 caratteri")
    private String microchip;

    private ETaglia taglia;

    private String coloreMantello;

    private boolean sterilizzato = false; // Default falso

    private String gruppoSanguigno;

    private String allergie;

    private String patologie;

    private EStatoAnimale stato = EStatoAnimale.SANO; // Default SANO

    private String noteGenerali;

    private String notePrivate;

    private Long proprietarioId;
}