package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.DocumentoAllegatoDTO;
import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentoAllegatoService {

    DocumentoAllegatoDTO uploadDocumento(Long animaleId, Long visitaId, Long fatturaId,
                                         MultipartFile file, ETipoDocumento tipoDocumento,
                                         String note);

    Resource downloadDocumento(Long documentoId);

    DocumentoAllegatoDTO getMetadati(Long documentoId);

    List<DocumentoAllegatoDTO> getDocumentiByAnimale(Long animaleId);

    List<DocumentoAllegatoDTO> getDocumentiByVisita(Long visitaId);

    List<DocumentoAllegatoDTO> getDocumentiByFattura(Long fatturaId);

    List<DocumentoAllegatoDTO> getDocumentiByAnimaleAndTipo(Long animaleId, ETipoDocumento tipoDocumento);

    List<DocumentoAllegatoDTO> getDocumentiGeneraliAnimale(Long animaleId);

    void eliminaDocumento(Long documentoId);
}