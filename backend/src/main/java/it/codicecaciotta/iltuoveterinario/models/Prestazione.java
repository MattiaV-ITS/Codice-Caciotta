package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

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
    private Integer durataStimata;

    @Column(name = "costo_base", nullable = false)
    private BigDecimal costoBase;

    @Column(name = "aliquota_iva", nullable = false)
    private BigDecimal aliquotaIva;

    @Column(name = "codice_prestazione", nullable = false, unique = true)
    private String codicePrestazione;

    @Column(nullable = false)
    private String stato = "attiva";

    @Column(nullable = true)
    private String note;
}
