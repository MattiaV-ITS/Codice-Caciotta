package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import lombok.Data;

// DTO per la visualizzazione degli animali nella lista
// TODO: Scegliere quali campi mostrare nella lista, per ora mostro i campi principali
@Data
public class AnimaleListaDTO {

    private Long id;
    private String nome;
    private String specie; // TODO: Considerare se mostrare la razza e la specie unite
    private String razza;
    private LocalDate dataNascita;
    private String sesso;
    private String microchip;
    private Long idProprietario; // ID del cliente a cui appartiene l'animale
    private String proprietario;  // Nome e cognome del proprietario, per visualizzazione nella lista
}