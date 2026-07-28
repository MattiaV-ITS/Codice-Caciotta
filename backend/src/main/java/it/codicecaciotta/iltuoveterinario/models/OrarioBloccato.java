package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "orari_bloccati")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrarioBloccato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "ora_inizio", nullable = false)
    private LocalTime oraInizio;

    @Column(name = "ora_fine", nullable = false)
    private LocalTime oraFine;

    @Column(name = "motivo")
    private String motivo;

    @Column(name = "creato_il")
    private LocalDate creatoIl;

    @Column(name = "creato_da")
    private String creatoDa;

    @PrePersist
    protected void onCreate() {
        creatoIl = LocalDate.now();
    }

    public String getOraInizioDisplay() {
        return oraInizio != null ? oraInizio.toString() : "";
    }

    public String getOraFineDisplay() {
        return oraFine != null ? oraFine.toString() : "";
    }

    public String getDataDisplay() {
        return data != null ? data.toString() : "";
    }
}