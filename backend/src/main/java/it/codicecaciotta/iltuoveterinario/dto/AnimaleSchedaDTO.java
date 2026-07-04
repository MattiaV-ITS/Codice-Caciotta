package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import it.codicecaciotta.iltuoveterinario.models.ESesso;
import it.codicecaciotta.iltuoveterinario.models.ETaglia;
import lombok.Data;

// DTO per la visualizzazione della scheda dell'animale
@Data
public class AnimaleSchedaDTO
{
    
    private Long id;
    private String stato; // Stato vaccinazioni e salute, per visualizzazione nella scheda
    private String nome;
    private String specie;
    private String razza;
    private LocalDate dataNascita; // per visualizzazione nella scheda, formato dd/MM/yyyy
    private String eta; // per visualizzazione nella scheda, calcolata a partire dalla data di nascita, formato "X anni, Y mesi"
    private ESesso sesso;
    private BigDecimal peso;
    private String microchip;
    private ETaglia taglia;
    private String coloreMantello;
    private Boolean sterilizzato;
    private String gruppoSanguigno;
    private String allergie;
    private String patologie;
    private String noteGenerali;
    private String notePrivate; // Note private visibili solo al veterinario
    private String idProprietario; // ID del cliente a cui appartiene l'animale
    private String proprietario;  // Nome e cognome del proprietario, per visualizzazione nella scheda
    private String telefonoProprietario; // Recapito telefonico del proprietario, per visualizzazione nella scheda
}
