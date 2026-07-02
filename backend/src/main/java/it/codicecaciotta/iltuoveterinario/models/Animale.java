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

    @Column(name = "data_di_nascita", nullable = true) 
    private LocalDate dataNascita;

    @Column(nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('M', 'F', 'ND'))"
    ) 
    private String sesso = "ND"; // M = Maschio, F = Femmina, ND = Non Definito

    @Column(nullable = false)
    private Double peso;

    @Column(length = 15, nullable = true, unique = true) // Non tutte le specie hanno il microchip. Microchip univoco
    @Size(min = 15, max = 15, message = "Il microchip deve avere esattamente 15 caratteri") // Per validazione lunghezza
    private String microchip;

    @Column(nullable = false)
    private String coloreMantello;

    @Column(nullable = false)
    private boolean sterilizzato = false;

    @Column(name = "gruppo_sanguigno", nullable = true) 
    private String gruppoSanguigno = "ND"; // Gruppo sanguigno default ND (Non Definito)

    @Column(nullable = true) // Allergie opzionali
    private String allergie;

    @Column(nullable = true) // Patologie opzionali
    private String patologie;

    @Column(name = "stato_sopravvivenza", nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('Sano', 'In cura', 'Deceduto'))"
    ) // indica se l animale è vivo o morto
    private String statoSopravvivenza; // vivo di default

    @Column(name = "note_generali", nullable = true) // Note opzionali
    private String noteGenerali;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Propietario proprietario;
}

