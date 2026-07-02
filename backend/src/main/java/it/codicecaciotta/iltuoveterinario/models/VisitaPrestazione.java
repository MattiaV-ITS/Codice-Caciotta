package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prestazioni")
@Data
public class VisitaPrestazione {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_esecuzione", nullable = false)
    private LocalDateTime dataEsecuzione;
    
    @Column(name = "nome_farmaco", nullable = true)
    private String nomeFarmaco;

    @Column(name = "lotto_farmaco", nullable = true)
    private String lottoFarmaco;

    @Column(name = "data_prossima_scadenza", nullable = true)
    private LocalDate dataProssimaScadenza;

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Visita visita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prestazione_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Prestazione prestazione;
    
    @PrePersist
    public void onCreate() {
        dataEsecuzione = LocalDateTime.now();
    }
}
