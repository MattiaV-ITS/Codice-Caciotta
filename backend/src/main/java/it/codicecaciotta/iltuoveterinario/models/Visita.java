package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Entity
@Table(name = "visite")
@Data
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_ora_visita", nullable = false)
    private LocalDateTime dataOraVisita;

    @Column(nullable = true) // in minuti, puo essere null se non effettuata
    private Integer durata;

    @Column(name = "importo_totale", nullable = false, precision = 10, scale = 2)
    private BigDecimal importoTotale;

    @Column(name = "tipo_visita", nullable = true)
    private String tipoVisita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animale_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Animale animale;

    @OneToOne(mappedBy = "visita", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonIgnore
    private DiarioClinico diarioClinico;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prenotazione_id", nullable = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Prenotazione prenotazione;
}
