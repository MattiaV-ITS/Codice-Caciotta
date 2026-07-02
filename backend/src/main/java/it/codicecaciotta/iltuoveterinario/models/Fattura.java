package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Table(name = "ricette")
@Data
public class Fattura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_fattura", length = 50, nullable = false, unique = true)
    private String numeroFattura;

    @Column(name = "data_emissione", nullable = false)
    private LocalDateTime dataEmissione;

    @Column(name = "denominazione_cliente", length = 100, nullable = false)
    private String denominazioneCliente;

    @Size(min = 16, max = 16)
    @Column(name = "codice_fiscale_cliente", length = 16, nullable = false)
    private String codiceFiscaleCliente;

    @Size(max = 11)
    @Column(name = "partita_iva_cliente", length = 11, nullable = true)
    private String partitaIvaCliente;

    @Column(name = "indirizzo_cliente", nullable = false)
    private String indirizzoCliente;

    @Size(min = 7, max = 7)
    @Column(name = "codice_destinatario", length = 7, nullable = false)
    private String codiceDestinatario;

    @Column(name = "pec_cliente", length = 256, nullable = true)
    private String pecCliente;

    @Column(name = "importo_imponibile", nullable = false)
    private BigDecimal importoImponibile;

    @Column(name = "aliquota_iva", nullable = false)
    private BigDecimal aliquotaIva;

    @Column(name = "importo_totale", nullable = false)
    private BigDecimal importoTotale;

    @Column(name = "metodo_pagamento", nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('Contanti', 'Bonifico', 'Carta di Credito', 'Altro'))"
    )
    private String metodoPagamento;

    @Column(name = "stato_pagamento", nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('Da pagare', 'Pagato', 'Annullato'))"
    )
    private String statoPagamento = "Da pagare";

    @Column(name = "data_ora_pagamento", nullable = true)
    private LocalDateTime dataOraPagamento;
    

    @Column(name = "stato_fattura", nullable = false,
            columnDefinition = "VARCHAR(20) CHECK (stato IN ('Bozza', 'Emessa', 'Annullata'))"
    )
    private String statoFattura = "Bozza";

    @Column(nullable = true)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private Propietario proprietario;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    private Visita visita;

    @PrePersist
    public void onCreate() {
        dataEmissione = LocalDateTime.now();
        dataOraPagamento = LocalDateTime.now();
    }
}
