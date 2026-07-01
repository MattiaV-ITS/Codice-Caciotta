package it.codicecaciotta.iltuoveterinario.models;

import java.time.LocalDate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
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

    @Column(name = "stato_prenotazione", nullable = false)
    private String statoPrenotazione = "attesa";

    @Column(name = "priorità", nullable = false)
    private String priorita = "bassa";

    @Column(nullable = true)
    private String note;
    
}
