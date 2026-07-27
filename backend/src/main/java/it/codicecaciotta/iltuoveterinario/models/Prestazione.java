package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

    @Column(name ="durata_stimata", nullable = false)
    @NotNull(message = "La durata stimata è obbligatoria")
    @Positive(message = "La durata stimata deve essere positiva")
    private Integer durataStimata; // in minuti

    @Column(name = "costo_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoBase;

    @Column(name = "aliquota_iva", nullable = false)
    private Integer aliquotaIva = 22; // percentuale

    @Column(nullable = false)
    private Boolean stato = true; // true = Disponibile, false = Non disponibile

    @Column(nullable = true)
    private String note;

    @Column(nullable = true)
    private String colore;
}
