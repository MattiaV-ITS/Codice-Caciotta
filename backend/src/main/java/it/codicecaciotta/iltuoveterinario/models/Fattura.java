package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "fatture")
@Data
public class Fattura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_fattura", nullable = false, unique = true)
    private String numeroFattura;

    @Column(name = "data_emissione", nullable = false)
    private LocalDateTime dataEmissione;

    @Column(name = "tipo_fattura", nullable = false, length = 20)
    private String tipoFattura = "Semplificata"; //Solo "Semplificata" per ora

    @Column(name = "codice_fiscale_cliente", length = 16, nullable = true)
    private String codiceFiscaleCliente;

    @Column(name = "indirizzo_cliente", nullable = true)
    private String indirizzoCliente;

    @Column(name = "citta_cliente", nullable = true)
    private String cittaCliente;

    @Column(name = "importo_totale", nullable = false, precision = 10, scale = 2)
    private BigDecimal importoTotale;

    @Column(name = "metodo_pagamento", nullable = true, length = 50)
    private String metodoPagamento;

    @Column(nullable = true)
    private String note;

    @Column(name = "dettaglio_servizi", nullable = true, columnDefinition = "TEXT")
    private String dettaglioServizi;

    @Column(name = "pagata", nullable = false)
    private boolean pagata = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Proprietario proprietario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Visita visita;

    @PrePersist
    public void onCreate() {
        dataEmissione = LocalDateTime.now();
    }
}