package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import lombok.Data;

// DTO per la visualizzazione dei proprietari nella lista
@Data
public class ProprietarioListaDTO {

    private Long id;
    private String nome;
    private String cognome;
    private String email;
    private String telefono;
    private String codiceFiscale;
    private LocalDate dataRegistrazione;
    private Boolean stato; // 1 = attivo, 0 = disattivo
    private Integer numeroAnimali; // Numero di animali associati al proprietario
}