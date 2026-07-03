package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "prenotazioni")
@Data
public class Prenotazione {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_prenotazione", nullable = false)
    private LocalDateTime dataPrenotazione;
    
    @Column(name = "data_ora_appuntamento", nullable = false)
    private LocalDateTime dataOraAppuntamento;
    
    @Column(nullable = false)
    private String motivo;

    @Column(name = "stato_prenotazione", nullable = false, length = 20)
    private String statoPrenotazione = "Attesa";

    @Column(name = "priorità", nullable = false, length = 20)
    private String priorita = "Bassa";

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "animale_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Animale animale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Proprietario proprietario;
    
    @PrePersist
    public void onCreate() {
        dataPrenotazione = LocalDateTime.now();
    }
}
