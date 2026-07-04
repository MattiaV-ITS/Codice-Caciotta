package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO per creazione di un proprietario. Contiene i campi necessari per creare un nuovo proprietario nel sistema.
 */
@Data
public class ProprietarioCreateDTO {

    @Size(min = 16, max = 16, message = "Codice fiscale deve avere esattamente 16 caratteri")
    private String codiceFiscale;

    @NotNull(message = "Nome non può essere null")
    private String nome;

    @NotNull(message = "Cognome non può essere null")
    private String cognome;

    @NotNull(message = "Email non può essere null")
    @Email(message = "L'email deve essere valida")
    private String email;

    @NotNull(message = "Telefono non può essere null")
    private String telefono;

    @NotNull(message = "Indirizzo non può essere null")
    private String indirizzo;

    @NotNull(message = "Città non può essere null")
    private String citta;

    @NotNull(message = "Data di registrazione non può essere null")
    private LocalDate dataRegistrazione;

    @NotNull(message = "Stato non può essere null")
    private Boolean stato = true; // Attivo di default
}