package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.Duration;

@Entity
@Table(name = "visite")
@Data
public class Visita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_ora_visita", nullable = false)
    private LocalDateTime dataOraVisita;

    @Column(name = "data_ora_fine_visita", nullable = true) // puo essere null se non ancora terminata
    private LocalDateTime dataOraFineVisita;

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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "visita_prestazioni",
        joinColumns = @JoinColumn(name = "visita_id"),
        inverseJoinColumns = @JoinColumn(name = "prestazione_id")
    )
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private List<Prestazione> prestazioni;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prenotazione_id", nullable = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Prenotazione prenotazione;

    // Metodo per calcolare la durata in minuti (calcolata dinamicamente)
    public Integer getDurata() {
        if (dataOraVisita == null || dataOraFineVisita == null) {
            return null;
        }
        Duration duration = Duration.between(dataOraVisita, dataOraFineVisita);
        return (int) duration.toMinutes();
    }

    // Metodo per impostare la durata (calcola dataOraFineVisita)
    public void setDurata(Integer durataMinuti) {
        if (durataMinuti == null || dataOraVisita == null) {
            dataOraFineVisita = null;
        } else {
            dataOraFineVisita = dataOraVisita.plusMinutes(durataMinuti);
        }
    }
}
