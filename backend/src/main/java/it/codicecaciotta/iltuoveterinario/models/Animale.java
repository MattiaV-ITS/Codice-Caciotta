package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column(nullable = false) // TODO: Sesso sconosciuto?
    private String sesso;

    @Column(nullable = false)
    private Double peso;

    @Column(length = 15, nullable = true, unique = true) // Non tutte le specie hanno il microchip. Microchip univoco
    @Size(min = 15, max = 15, message = "Il microchip deve avere esattamente 15 caratteri") // Per validazione lunghezza
    private String microchip;

    @Column(nullable = false)
    private String coloreMantello;

    @Column(nullable = false)
    private boolean sterilizzato = false;

    @Column(name = "gruppo_sanguigno", nullable = false) // TODO: Gruppo sanguigno sconosciuto
    private String gruppoSanguigno;

    @Column(nullable = true) // Allergie opzionali
    private String allergie;

    @Column(nullable = true) // Patologie opzionali
    private String patologie;

    @Column(name = "stato_sopravvivenza", nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('Sano', 'In cura', 'Deceduto'))"
    ) // indica se l animale è vivo o morto
    private boolean statoSopravvivenza = true; // vivo di default

    @Column(name = "note_generali", nullable = true) // Note opzionali
    private String noteGenerali;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false) // TODO: Considerare se rendere opzionale il proprietario, per animali senza proprietario
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Propietario proprietario;
}
