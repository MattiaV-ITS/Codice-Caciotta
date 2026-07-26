package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class FatturaDTO {
    private Long id;
    private String numeroFattura;
    private BigDecimal importoTotale;
    private String tipoFattura;
    private String dettaglioServizi;
    private String codiceFiscaleCliente;
    private String indirizzoCliente;
    private String cittaCliente;
    private String metodoPagamento;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataEmissione;
    private Long visitaId;
    private Long proprietarioId;
    private boolean pagata;

    public FatturaDTO() {}

    public FatturaDTO(Long id, String numeroFattura, BigDecimal importoTotale, String tipoFattura,
                     String dettaglioServizi, String codiceFiscaleCliente, String indirizzoCliente,
                     String cittaCliente, String metodoPagamento, LocalDateTime dataEmissione,
                     Long visitaId, Long proprietarioId, boolean pagata) {
        this.id = id;
        this.numeroFattura = numeroFattura;
        this.importoTotale = importoTotale;
        this.tipoFattura = tipoFattura;
        this.dettaglioServizi = dettaglioServizi;
        this.codiceFiscaleCliente = codiceFiscaleCliente;
        this.indirizzoCliente = indirizzoCliente;
        this.cittaCliente = cittaCliente;
        this.metodoPagamento = metodoPagamento;
        this.dataEmissione = dataEmissione;
        this.visitaId = visitaId;
        this.proprietarioId = proprietarioId;
        this.pagata = pagata;
    }
}