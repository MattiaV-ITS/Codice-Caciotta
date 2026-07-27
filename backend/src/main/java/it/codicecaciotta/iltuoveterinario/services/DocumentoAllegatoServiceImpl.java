package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.DocumentoAllegatoDTO;
import it.codicecaciotta.iltuoveterinario.models.DocumentoAllegato;
import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import it.codicecaciotta.iltuoveterinario.repositories.DocumentoAllegatoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentoAllegatoServiceImpl implements DocumentoAllegatoService {

    private final DocumentoAllegatoRepository repository;

    @Value("${app.upload.dir:/app/uploads}")
    private String uploadDir;

    public DocumentoAllegatoServiceImpl(DocumentoAllegatoRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public DocumentoAllegatoDTO uploadDocumento(Long animaleId, Long visitaId, Long fatturaId,
                                                MultipartFile file, ETipoDocumento tipoDocumento,
                                                String note) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File vuoto");
        }

        String nomeOriginale = file.getOriginalFilename();
        String estensione = "";
        if (nomeOriginale != null && nomeOriginale.contains(".")) {
            estensione = nomeOriginale.substring(nomeOriginale.lastIndexOf("."));
        }
        String nomeUnivoco = UUID.randomUUID().toString() + estensione;

        // Costruisci percorso: /app/uploads/animali/{animaleId}/
        Path cartellaAnimale = Paths.get(uploadDir, "animali", String.valueOf(animaleId));
        try {
            Files.createDirectories(cartellaAnimale);
        } catch (IOException e) {
            throw new RuntimeException("Impossibile creare la directory di upload: " + cartellaAnimale, e);
        }

        Path percorsoDestinazione = cartellaAnimale.resolve(nomeUnivoco);
        try {
            Files.copy(file.getInputStream(), percorsoDestinazione, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Errore durante il salvataggio del file", e);
        }

        DocumentoAllegato documento = new DocumentoAllegato();
        documento.setAnimaleId(animaleId);
        documento.setVisitaId(visitaId);
        documento.setFatturaId(fatturaId);
        documento.setNomeOriginale(nomeOriginale != null ? nomeOriginale : "file" + estensione);
        documento.setPercorsoFile("animali/" + animaleId + "/" + nomeUnivoco);
        documento.setTipoDocumento(tipoDocumento != null ? tipoDocumento : ETipoDocumento.DOCUMENTO_GENERICO);
        documento.setDimensioneBytes(file.getSize());
        documento.setTipoMIME(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        documento.setNote(note);
        documento.setDataCaricamento(LocalDateTime.now());
        documento.setDataDocumento(LocalDateTime.now());

        DocumentoAllegato saved = repository.save(documento);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadDocumento(Long documentoId) {
        DocumentoAllegato documento = repository.findById(documentoId)
                .orElseThrow(() -> new EntityNotFoundException("Documento non trovato con id: " + documentoId));

        Path filePath = Paths.get(uploadDir, documento.getPercorsoFile());
        Resource resource = new FileSystemResource(filePath.toFile());

        if (!resource.exists()) {
            throw new EntityNotFoundException("File non trovato sul disco: " + filePath);
        }

        return resource;
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentoAllegatoDTO getMetadati(Long documentoId) {
        DocumentoAllegato documento = repository.findById(documentoId)
                .orElseThrow(() -> new EntityNotFoundException("Documento non trovato con id: " + documentoId));
        return toDTO(documento);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoAllegatoDTO> getDocumentiByAnimale(Long animaleId) {
        return repository.findByAnimaleId(animaleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoAllegatoDTO> getDocumentiByVisita(Long visitaId) {
        return repository.findByVisitaId(visitaId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoAllegatoDTO> getDocumentiByFattura(Long fatturaId) {
        return repository.findByFatturaId(fatturaId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoAllegatoDTO> getDocumentiByAnimaleAndTipo(Long animaleId, ETipoDocumento tipoDocumento) {
        return repository.findByAnimaleIdAndTipoDocumento(animaleId, tipoDocumento).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentoAllegatoDTO> getDocumentiGeneraliAnimale(Long animaleId) {
        return repository.findByAnimaleIdAndVisitaIdIsNull(animaleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void eliminaDocumento(Long documentoId) {
        DocumentoAllegato documento = repository.findById(documentoId)
                .orElseThrow(() -> new EntityNotFoundException("Documento non trovato con id: " + documentoId));

        // Elimina il file fisico
        Path filePath = Paths.get(uploadDir, documento.getPercorsoFile());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Errore durante l'eliminazione del file", e);
        }

        repository.delete(documento);
    }

    private DocumentoAllegatoDTO toDTO(DocumentoAllegato doc) {
        DocumentoAllegatoDTO dto = new DocumentoAllegatoDTO();
        dto.setId(doc.getId());
        dto.setAnimaleId(doc.getAnimaleId());
        dto.setVisitaId(doc.getVisitaId());
        dto.setFatturaId(doc.getFatturaId());
        dto.setNomeOriginale(doc.getNomeOriginale());
        dto.setTipoDocumento(doc.getTipoDocumento());
        dto.setDimensioneBytes(doc.getDimensioneBytes());
        dto.setTipoMIME(doc.getTipoMIME());
        dto.setNote(doc.getNote());
        dto.setDataCaricamento(doc.getDataCaricamento());
        dto.setDataDocumento(doc.getDataDocumento());
        return dto;
    }
}