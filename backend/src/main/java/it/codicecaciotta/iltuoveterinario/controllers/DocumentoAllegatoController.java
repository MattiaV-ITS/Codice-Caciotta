package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.DocumentoAllegatoDTO;
import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import it.codicecaciotta.iltuoveterinario.services.DocumentoAllegatoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentoAllegatoController {

    private final DocumentoAllegatoService documentoService;

    public DocumentoAllegatoController(DocumentoAllegatoService documentoService) {
        this.documentoService = documentoService;
    }

    // ==================== UPLOAD ====================

    @PostMapping("/animali/{animaleId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DocumentoAllegatoDTO> uploadDocumentoAnimale(
            @PathVariable Long animaleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoDocumento") ETipoDocumento tipoDocumento,
            @RequestParam(value = "note", required = false) String note) {
        try {
            DocumentoAllegatoDTO dto = documentoService.uploadDocumento(
                    animaleId, null, null, file, tipoDocumento, note);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/visite/{visitaId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DocumentoAllegatoDTO> uploadDocumentoVisita(
            @PathVariable Long visitaId,
            @RequestParam("animaleId") Long animaleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoDocumento") ETipoDocumento tipoDocumento,
            @RequestParam(value = "note", required = false) String note) {
        try {
            DocumentoAllegatoDTO dto = documentoService.uploadDocumento(
                    animaleId, visitaId, null, file, tipoDocumento, note);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/fatture/{fatturaId}/documento")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DocumentoAllegatoDTO> uploadScanFattura(
            @PathVariable Long fatturaId,
            @RequestParam("animaleId") Long animaleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "note", required = false) String note) {
        try {
            DocumentoAllegatoDTO dto = documentoService.uploadDocumento(
                    animaleId, null, fatturaId, file, ETipoDocumento.SCAN_FATTURA, note);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== LISTA ====================

    @GetMapping("/animali/{animaleId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByAnimale(@PathVariable Long animaleId) {
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByAnimale(animaleId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/animali/{animaleId}/documenti/tipo/{tipo}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByAnimaleAndTipo(
            @PathVariable Long animaleId, @PathVariable ETipoDocumento tipo) {
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByAnimaleAndTipo(animaleId, tipo));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/animali/{animaleId}/documenti/generali")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiGenerali(@PathVariable Long animaleId) {
        try {
            return ResponseEntity.ok(documentoService.getDocumentiGeneraliAnimale(animaleId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/visite/{visitaId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByVisita(@PathVariable Long visitaId) {
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByVisita(visitaId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/fatture/{fatturaId}/documento")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByFattura(@PathVariable Long fatturaId) {
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByFattura(fatturaId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== DOWNLOAD / METADATI ====================

    @GetMapping("/documenti/{documentoId}/download")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long documentoId) {
        try {
            DocumentoAllegatoDTO metadati = documentoService.getMetadati(documentoId);
            Resource resource = documentoService.downloadDocumento(documentoId);

            String contentType = metadati.getTipoMIME() != null ? metadati.getTipoMIME() : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + metadati.getNomeOriginale() + "\"")
                    .body(resource);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/documenti/{documentoId}/metadati")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<DocumentoAllegatoDTO> getMetadati(@PathVariable Long documentoId) {
        try {
            return ResponseEntity.ok(documentoService.getMetadati(documentoId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== ELIMINAZIONE ====================

    @DeleteMapping("/documenti/{documentoId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> eliminaDocumento(@PathVariable Long documentoId) {
        try {
            documentoService.eliminaDocumento(documentoId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}