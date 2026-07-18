package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "prestazioni")
@Data
public class Prestazione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_prestazione", nullable = false)
    private String nomePrestazione;

    @Column(nullable = true)
    private String descrizione;

    @Column(nullable = false)
    private String categoria;

    @Column(name ="durata_stimata", nullable = false)
    private Integer durataStimata; // in minuti

    @Column(name = "costo_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoBase;

    @Column(name = "aliquota_iva", nullable = false)
    private Integer aliquotaIva = 22; // percentuale

    @Column(nullable = false)
    private String stato = "Disponibile"; //TODO: rendere boolean

    @Column(nullable = true)
    private String note;

    @Column(nullable = true)
    private String colore;
}
