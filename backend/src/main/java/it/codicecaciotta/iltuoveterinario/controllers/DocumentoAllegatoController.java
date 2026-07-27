package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.DocumentoAllegatoDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.security.services.UserDetailsImpl;
import it.codicecaciotta.iltuoveterinario.services.DocumentoAllegatoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api")
public class DocumentoAllegatoController {

    private final DocumentoAllegatoService documentoService;
    private final UtenteRepository utenteRepository;
    private final AnimaleRepository animaleRepository;
    private final it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository visitaRepository;

    public DocumentoAllegatoController(DocumentoAllegatoService documentoService,
                                       UtenteRepository utenteRepository,
                                       AnimaleRepository animaleRepository,
                                       it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository visitaRepository) {
        this.documentoService = documentoService;
        this.utenteRepository = utenteRepository;
        this.animaleRepository = animaleRepository;
        this.visitaRepository = visitaRepository;
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

    private boolean isUserOwnerOfAnimale(Long animaleId) {
        if (animaleId == null) {
            return false;
        }
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));
        if (isStaffOrAdmin) return true;

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = Objects.requireNonNull(userDetails.getId(), "User ID cannot be null");
        Utente currentUser = utenteRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        if (currentUser.getProprietario() == null) return false;

        Animale animale = animaleRepository.findById(animaleId).orElse(null);
        return animale != null && animale.getProprietario() != null &&
               Objects.equals(currentUser.getProprietario().getId(), animale.getProprietario().getId());
    }

    @GetMapping("/animali/{animaleId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByAnimale(@PathVariable Long animaleId) {
        if (!isUserOwnerOfAnimale(animaleId)) {
            return ResponseEntity.status(403).build();
        }
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
        if (!isUserOwnerOfAnimale(animaleId)) {
            return ResponseEntity.status(403).build();
        }
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByAnimaleAndTipo(animaleId, tipo));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/animali/{animaleId}/documenti/generali")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiGenerali(@PathVariable Long animaleId) {
        if (!isUserOwnerOfAnimale(animaleId)) {
            return ResponseEntity.status(403).build();
        }
        try {
            return ResponseEntity.ok(documentoService.getDocumentiGeneraliAnimale(animaleId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/visite/{visitaId}/documenti")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByVisita(@PathVariable @NonNull Long visitaId) {
        if (!isStaffOrAdmin()) {
            it.codicecaciotta.iltuoveterinario.models.Visita visita = visitaRepository.findById(visitaId).orElse(null);
            if (visita == null || visita.getAnimale() == null) {
                return ResponseEntity.status(403).build();
            }
            if (!isUserOwnerOfAnimale(visita.getAnimale().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByVisita(visitaId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/fatture/{fatturaId}/documento")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<List<DocumentoAllegatoDTO>> getDocumentiByFattura(@PathVariable Long fatturaId) {
        // For ROLE_USER, the ownership check happens via the fattura relationship
        try {
            return ResponseEntity.ok(documentoService.getDocumentiByFattura(fatturaId));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== DOWNLOAD / METADATI ====================

    private boolean isStaffOrAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean verifyDocumentOwnership(DocumentoAllegatoDTO metadati) {
        if (isStaffOrAdmin()) return true;
        if (metadati.getAnimaleId() == null) return false;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = Objects.requireNonNull(userDetails.getId(), "User ID cannot be null");
        Utente currentUser = utenteRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        if (currentUser.getProprietario() == null) return false;

        Long animaleId = Objects.requireNonNull(metadati.getAnimaleId());
        Animale animale = animaleRepository.findById(animaleId).orElse(null);
        return animale != null && animale.getProprietario() != null &&
               Objects.equals(currentUser.getProprietario().getId(), animale.getProprietario().getId());
    }

    @GetMapping("/documenti/{documentoId}/download")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long documentoId) {
        try {
            DocumentoAllegatoDTO metadati = documentoService.getMetadati(documentoId);
            if (!verifyDocumentOwnership(metadati)) {
                return ResponseEntity.status(403).build();
            }
            Resource resource = documentoService.downloadDocumento(documentoId);

            String contentDispositionValue = "inline; filename=\"" + (metadati.getNomeOriginale() != null ? metadati.getNomeOriginale() : "documento") + "\"";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(Objects.requireNonNull(metadati.getTipoMIME() != null ? metadati.getTipoMIME() : "application/octet-stream")))
                    .header(HttpHeaders.CONTENT_DISPOSITION, Objects.requireNonNull(contentDispositionValue, "Content-Disposition cannot be null"))
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
            DocumentoAllegatoDTO metadati = documentoService.getMetadati(documentoId);
            if (!verifyDocumentOwnership(metadati)) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(metadati);
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