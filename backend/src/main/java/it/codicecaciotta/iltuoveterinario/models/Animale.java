package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDate;

import org.hibernate.annotations.Check;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "animali")
@Data
public class Animale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String specie;

    @Column(nullable = true) // Razza puo essere null per alcune specie, quindi non è obbligatorio
    private String razza;

    @Column(name = "data_di_nascita", nullable = false) // TODO: Data di nascita sconosciuta?
    private LocalDate dataNascita;

    @Column(nullable = true)
    @Check(constraints = "sesso IN ('M', 'F')") // Sesso puo essere null per alcune specie, quindi non è obbligatorio
    private String sesso;

    @Column(nullable = false)
    private Double peso;

    @Column(length = 15, nullable = true, unique = true) // Non tutte le specie hanno il microchip. Microchip univoco
    @Size(min = 15, max = 15, message = "Il microchip deve avere esattamente 15 caratteri") // Per validazione lunghezza
    private String microchip;

    @Column(nullable = true)
    @Check(constraints = "taglia IN ('piccola', 'media', 'grande')") // Taglia puo essere null per alcune specie, quindi non è obbligatorio
    private String taglia;

    @Column(name = "colore_mantello", nullable = true) // Colore mantello puo essere null per alcune specie, quindi non è obbligatorio
    private String coloreMantello;

    @Column(nullable = false)
    private boolean sterilizzato = false;

    @Column(name = "gruppo_sanguigno", nullable = true) // Alcune specie non hanno gruppo sanguigno, quindi non è obbligatorio
    private String gruppoSanguigno;

    @Column(nullable = true) // Allergie opzionali
    private String allergie;

    @Column(nullable = true) // Patologie opzionali
    private String patologie;

    //TODO: Stato di salute da cambiare nell'analisi
    @Column(name = "stato", nullable = false) // indica lo stato di salute dell'animale, sano, deceduto, vaccino scaduto, in cura,...
    private String stato = "sano"; // sano di default

    @Column(name = "note_generali", nullable = true) // Note opzionali
    private String noteGenerali;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false) // TODO: Considerare se rendere opzionale il proprietario, per animali senza proprietario
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Proprietario proprietario;
}
