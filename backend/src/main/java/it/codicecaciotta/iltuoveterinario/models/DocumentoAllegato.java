package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "documenti_allegati")
@Data
public class DocumentoAllegato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "animale_id", nullable = false)
    private Long animaleId;

    @Column(name = "visita_id", nullable = true)
    private Long visitaId;

    @Column(name = "fattura_id", nullable = true)
    private Long fatturaId;

    @Column(name = "nome_originale", nullable = false)
    private String nomeOriginale;

    @Column(name = "percorso_file", nullable = false)
    private String percorsoFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false)
    private ETipoDocumento tipoDocumento;

    @Column(name = "dimensione_bytes", nullable = false)
    private Long dimensioneBytes;

    @Column(name = "tipo_mime", nullable = false)
    private String tipoMIME;

    @Column(length = 500)
    private String note;

    @Column(name = "data_caricamento", nullable = false)
    private LocalDateTime dataCaricamento;

    @Column(name = "data_documento", nullable = true)
    private LocalDateTime dataDocumento;

    @PrePersist
    public void onCreate() {
        dataCaricamento = LocalDateTime.now();
        if (dataDocumento == null) {
            dataDocumento = LocalDateTime.now();
        }
    }
}