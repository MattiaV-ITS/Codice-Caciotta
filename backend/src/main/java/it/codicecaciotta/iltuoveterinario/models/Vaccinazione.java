package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "vaccinazioni")
@Data
public class Vaccinazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_vaccino", nullable = false)
    private String tipoVaccino;

    @Column(name = "data_somministrazione", nullable = false)
    private LocalDate dataSomministrazione;

    @Column(name = "data_scadenza", nullable = false)
    private LocalDate dataScadenza;

    @Column(nullable = false)
    private String lotto;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EVaccinationStatus stato;

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animale_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonBackReference
    private Animale animale;
}