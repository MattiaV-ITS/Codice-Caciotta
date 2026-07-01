package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ricette")
@Data
public class Ricetta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codice_ricetta", nullable = false)
    private String codiceRicetta;

    @Column(name = "data_emissione", nullable = false)
    private LocalDateTime dataEmissione;

    @Column(name = "farmaco_prescritto", nullable = false)
    private String farmacoPrescritto;

    @Column(name = "posologia_modalità_uso", nullable = false)
    private String posologiaModalitaUso;

    @Column(name = "durata_terapua", nullable = false)
    private String durataTerapia;

    @Column(nullable = true)
    private String note;
}
