package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ricette")
@Data
public class Fattura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_fattura", nullable = false)
    private String numeroFattura;

    @Column(name = "data_emissione", nullable = false)
    private LocalDateTime dataEmissione;

    @Column(name = "denominazione_cliente", nullable = false)
    private String denominazioneCliente;

    @Column(name = "codice_fiscale_cliente", unique = true, length = 16, nullable = false)
    private String codiceFiscaleCliente;

    @Column(name = "partita_iva_cliente", nullable = true)
    private String partitaIvaCliente;

    @Column(name = "indirizzo_cliente", nullable = false)
    private String indirizzoCliente;

    @Column(name = "codice_destinatazio", nullable = false)
    private String codiceDestinatario;

    @Column(name = "pec_cliente", nullable = true)
    private String pecCliente;

    @Column(name = "importo_imponibile", nullable = false)
    private BigDecimal importoImponibile;

    @Column(name = "aliquota_iva", nullable = false)
    private BigDecimal aliquotaIva;

    @Column(name = "importo_totale", nullable = false)
    private BigDecimal importoTotale;

    @Column(name = "metodo_pagamento", nullable = false)
    private String metodoPagamento;

    @Column(name = "stato_pagamento", nullable = false)
    private String statoPagamento = "da pagare";

    @Column(name = "data_ora_pagamento", nullable = true)
    private LocalDateTime dataOraPagamento;

    @Column(name = "stato_fattura", nullable = false)
    private String statoFattura = "bozza";

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private Propietario proprietario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    private Visita visita;

}
