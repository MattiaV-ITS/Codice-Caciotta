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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prenotazione_id", nullable = true)
    private Prenotazione prenotazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animale_id", nullable = false)
    private Animale animale;
}