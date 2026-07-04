package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import it.codicecaciotta.iltuoveterinario.models.ESesso;
import it.codicecaciotta.iltuoveterinario.models.EStatoAnimale;
import it.codicecaciotta.iltuoveterinario.models.ETaglia;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO per aggiornamento parziale di un animale. Tutti i campi sono opzionali.
 */
@Data
public class AnimaleUpdateDTO {

    // Campi NON NULLABILI -> accettano omissione, ma rifiutano esplicito null
    @JsonSetter(nulls = Nulls.FAIL)
    private String nome;

    @JsonSetter(nulls = Nulls.FAIL)
    private String specie;

    @JsonSetter(nulls = Nulls.FAIL)
    private LocalDate dataNascita;

    @JsonSetter(nulls = Nulls.FAIL)
    private BigDecimal peso;

    @JsonSetter(nulls = Nulls.FAIL)
    private EStatoAnimale stato;

    // Campi NULLABILI -> possono essere null o omessi
    private String razza;
    private ESesso sesso;

    @Size(min = 15, max = 15, message = "Microchip deve avere esattamente 15 caratteri")
    private String microchip;

    private ETaglia taglia;
    private String coloreMantello;
    private Boolean sterilizzato;
    private String gruppoSanguigno;
    private String allergie;
    private String patologie;
    private String noteGenerali;
    private String notePrivate;
    private Long proprietarioId; // Non puo rimuovere il proprietario, solo cambiarlo
}
