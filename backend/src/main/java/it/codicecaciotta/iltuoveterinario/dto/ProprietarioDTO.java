package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Data;

// DTO per la visualizzazione dei proprietari nella lista
@Data
public class ProprietarioDTO {

    private Long id;
    private String nome;
    private String cognome;
    private String email;
    private String telefono;
    private String indirizzo;
    private String citta;
    private LocalDate dataRegistrazione;
    private String codiceFiscale;
    private Boolean stato; // 1 = attivo, 0 = disattivo
    private List<Long> animaliIds; // Lista degli ID degli animali associati al proprietario
}