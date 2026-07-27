package it.codicecaciotta.iltuoveterinario.dto;

import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentoAllegatoDTO {
    private Long id;
    private Long animaleId;
    private Long visitaId;
    private Long fatturaId;
    private String nomeOriginale;
    private ETipoDocumento tipoDocumento;
    private Long dimensioneBytes;
    private String tipoMIME;
    private String note;
    private LocalDateTime dataCaricamento;
    private LocalDateTime dataDocumento;

    public DocumentoAllegatoDTO() {}

    public DocumentoAllegatoDTO(Long id, Long animaleId, Long visitaId, Long fatturaId,
                                String nomeOriginale, ETipoDocumento tipoDocumento,
                                Long dimensioneBytes, String tipoMIME, String note,
                                LocalDateTime dataCaricamento, LocalDateTime dataDocumento) {
        this.id = id;
        this.animaleId = animaleId;
        this.visitaId = visitaId;
        this.fatturaId = fatturaId;
        this.nomeOriginale = nomeOriginale;
        this.tipoDocumento = tipoDocumento;
        this.dimensioneBytes = dimensioneBytes;
        this.tipoMIME = tipoMIME;
        this.note = note;
        this.dataCaricamento = dataCaricamento;
        this.dataDocumento = dataDocumento;
    }
}