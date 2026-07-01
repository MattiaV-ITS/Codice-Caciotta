package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prenotazione_prestazione")
@Data
public class PrenotazionePrestazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal prezzoPrenotato;

    @Column(nullable = true)
    private String note;
}
