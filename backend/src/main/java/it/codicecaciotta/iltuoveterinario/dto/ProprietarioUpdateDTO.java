package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO per update parziale di un proprietario. Tutti i campi sono opzionali.
 */
@Data
public class ProprietarioUpdateDTO {

    @Size(min = 16, max = 16, message = "Codice fiscale deve avere esattamente 16 caratteri")
    private String codiceFiscale;

    @JsonSetter(nulls = Nulls.FAIL)
    @Email(message = "L'email deve essere valida")
    private String email;

    @JsonSetter(nulls = Nulls.FAIL)
    private String nome;

    @JsonSetter(nulls = Nulls.FAIL)
    private String cognome;

    @JsonSetter(nulls = Nulls.FAIL)
    private String telefono;

    @JsonSetter(nulls = Nulls.FAIL)
    private String indirizzo;

    @JsonSetter(nulls = Nulls.FAIL)
    private String citta;

    @JsonSetter(nulls = Nulls.FAIL)
    private LocalDate dataRegistrazione;

    @JsonSetter(nulls = Nulls.FAIL)
    private Boolean stato;
}