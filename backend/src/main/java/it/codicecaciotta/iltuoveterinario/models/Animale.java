package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDate;

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

    @Column(nullable = false)
    private String sesso;

    @Column(nullable = false)
    private Double peso;

    @Column(length = 15, nullable = true, unique = true) // Non tutte le specie hanno il microchip. Microchip univoco
    @Size(min = 15, max = 15, message = "Il microchip deve avere esattamente 15 caratteri") // Per validazione lunghezza
    private String microchip;

    @Column(name = "note", nullable = true) // Note opzionali
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false) // TODO: Considerare se rendere opzionale il proprietario, per animali senza proprietario
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Propietario proprietario;
}
