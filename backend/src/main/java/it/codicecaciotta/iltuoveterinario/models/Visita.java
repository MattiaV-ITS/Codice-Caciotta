package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "visite")
@Data
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_ora_visita", nullable = false)
    private LocalDateTime dataOraVisita;

    @Column(nullable = false)
    private Integer durata;

    @Column(name = "importo_totale", nullable = false)
    private Double importoTotale;

    @Column(nullable = false)
    private String stato;

    @Column(nullable = true)
    private String note;
}
