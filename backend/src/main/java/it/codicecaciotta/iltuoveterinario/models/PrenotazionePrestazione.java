package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "prenotazione_prestazione")
@Data
public class PrenotazionePrestazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prezzoPrenotato;

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prenotazione_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Prenotazione prenotazione;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prestazione_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Prestazione prestazione;
}
