package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.ESesso;
import lombok.Data;

// DTO per la visualizzazione degli animali nella lista
@Data
public class AnimaleListaDTO {

    private Long id;
    private String nome;
    private String specie;
    private String razza;
    private LocalDate dataNascita;
    private ESesso sesso;
    private String microchip;
    private String stato;
    private Long idProprietario; // ID del cliente a cui appartiene l'animale
    private String proprietario;  // Nome e cognome del proprietario, per visualizzazione nella lista
}