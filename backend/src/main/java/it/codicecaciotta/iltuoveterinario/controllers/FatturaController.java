package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.FatturaDTO;
import it.codicecaciotta.iltuoveterinario.models.Fattura;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.FatturaRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.util.Map;

@RestController
@RequestMapping("/api/fatture")
public class FatturaController {

    private final FatturaRepository fatturaRepository;

    private final VisitaRepository visitaRepository;

    FatturaController(FatturaRepository fatturaRepository, VisitaRepository visitaRepository) {
        this.fatturaRepository = fatturaRepository;
        this.visitaRepository = visitaRepository;
    }

    // Helper per convertire Fattura -> FatturaDTO
    private FatturaDTO toDTO(Fattura f) {
        return new FatturaDTO(
            f.getId(),
            f.getNumeroFattura(),
            f.getImportoTotale(),
            f.getTipoFattura(),
            f.getDettaglioServizi(),
            f.getCodiceFiscaleCliente(),
            f.getIndirizzoCliente(),
            f.getCittaCliente(),
            f.getMetodoPagamento(),
            f.getDataEmissione(),
            f.getVisita() != null ? f.getVisita().getId() : null,
            f.getProprietario() != null ? f.getProprietario().getId() : null,
            f.isPagata()
        );
    }

    // Crea una nuova fattura per una visita
    @PostMapping("/visita/{visitaId}")
    @Transactional
    public ResponseEntity<FatturaDTO> createFatturaForVisita(@PathVariable("visitaId") Long visitaId, @RequestBody Fattura fattura) {
        Long safeVisitaId = Objects.requireNonNull(visitaId, "visitaId must not be null");
        Optional<Visita> visitaOptional = visitaRepository.findById(safeVisitaId);
        if (visitaOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Visita visita = visitaOptional.get();
        
        // Check if visita has a valid animale with proprietario
        if (visita.getAnimale() == null || visita.getAnimale().getProprietario() == null) {
            return ResponseEntity.badRequest().body(null);
        }
        
        fattura.setVisita(visita);
        fattura.setProprietario(visita.getAnimale().getProprietario());

        // Calcola importo totale dalle prestazioni se non specificato
        if (fattura.getImportoTotale() == null && visita.getPrestazioni() != null && !visita.getPrestazioni().isEmpty()) {
            BigDecimal importoFromPrestazioni = visita.getPrestazioni().stream()
                .map(p -> p.getCostoBase() != null ? p.getCostoBase() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            fattura.setImportoTotale(importoFromPrestazioni);
        }

        // Ora solo fatture semplificate - imposta tipo fisso
        fattura.setTipoFattura("Semplificata");
        
        // Genera numero fattura unico se non fornito
        if (fattura.getNumeroFattura() == null || fattura.getNumeroFattura().isEmpty()) {
            fattura.setNumeroFattura("FAT-" + safeVisitaId + "-" + UUID.randomUUID().toString().substring(0, 8));
        }

        // Imposta codice fiscale dal proprietario se non già impostato e proprietario esiste
        if (fattura.getCodiceFiscaleCliente() == null && visita.getAnimale() != null && visita.getAnimale().getProprietario() != null && visita.getAnimale().getProprietario().getCodiceFiscale() != null) {
            fattura.setCodiceFiscaleCliente(visita.getAnimale().getProprietario().getCodiceFiscale());
        }

        // Imposta indirizzo e città dal proprietario se non già impostati e proprietario esiste
        Proprietario proprietario = (visita.getAnimale() != null && visita.getAnimale().getProprietario() != null) ? visita.getAnimale().getProprietario() : null;
        if (fattura.getIndirizzoCliente() == null && proprietario != null && proprietario.getIndirizzo() != null) {
            fattura.setIndirizzoCliente(proprietario.getIndirizzo());
        }
        if (fattura.getCittaCliente() == null && proprietario != null && proprietario.getCitta() != null) {
            fattura.setCittaCliente(proprietario.getCitta());
        }

        try {
            // Validate required fields before saving
            if (fattura.getImportoTotale() == null) {
                return ResponseEntity.badRequest().body(null);
            }
            
            Fattura savedFattura = fatturaRepository.save(fattura);
            
            // Convert to DTO before returning
            FatturaDTO dto = toDTO(savedFattura);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("ERROR: Exception during fattura creation: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            System.out.println(sw.toString());
            return ResponseEntity.status(500).build();
        }
    }

    // Ottieni fattura per ID
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<FatturaDTO> getFattura(@PathVariable("id") Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        Optional<Fattura> fattura = fatturaRepository.findById(safeId);
        if (fattura.isPresent()) {
            Fattura f = fattura.get();
            return ResponseEntity.ok(toDTO(f));
        }
        return ResponseEntity.notFound().build();
    }

    // Ottieni fatture per visita
    @GetMapping("/visita/{visitaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FatturaDTO>> getFattureByVisita(@PathVariable("visitaId") Long visitaId) {
        Long safeVisitaId = Objects.requireNonNull(visitaId, "visitaId must not be null");
        List<Fattura> fatture = fatturaRepository.findByVisitaId(safeVisitaId);
        List<FatturaDTO> fattureDTO = new java.util.ArrayList<>();
        for (Fattura f : fatture) {
            fattureDTO.add(toDTO(f));
        }
        return ResponseEntity.ok(fattureDTO);
    }

    // Ottieni tutte le fatture
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<FatturaDTO>> getAllFatture() {
        List<Fattura> fatture = fatturaRepository.findAll();
        List<FatturaDTO> fattureDTO = new java.util.ArrayList<>();
        for (Fattura f : fatture) {
            fattureDTO.add(toDTO(f));
        }
        return ResponseEntity.ok(fattureDTO);
    }

    // Aggiorna una fattura
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<FatturaDTO> updateFattura(@PathVariable("id") Long id, @RequestBody Fattura fatturaDetails) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        Optional<Fattura> fatturaOptional = fatturaRepository.findById(safeId);
        if (fatturaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Fattura fattura = fatturaOptional.get();
        fattura.setTipoFattura("Semplificata"); // Tipo fisso
        fattura.setImportoTotale(fatturaDetails.getImportoTotale());
        fattura.setMetodoPagamento(fatturaDetails.getMetodoPagamento());
        fattura.setNote(fatturaDetails.getNote());
        fattura.setDettaglioServizi(fatturaDetails.getDettaglioServizi());

        Fattura updatedFattura = fatturaRepository.save(fattura);
        return ResponseEntity.ok(toDTO(updatedFattura));
    }

    // Elimina una fattura
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteFattura(@PathVariable("id") Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        Fattura fattura = fatturaRepository.findById(safeId)
            .orElseThrow(() -> new IllegalStateException("Fattura not found"));

        fatturaRepository.delete(Objects.requireNonNull(fattura, "Fattura not found"));
        return ResponseEntity.noContent().build();
    }

    // Imposta stato pagamento fattura
    @PatchMapping("/{id}/pagamento")
    @Transactional
    public ResponseEntity<FatturaDTO> setPagato(@PathVariable("id") Long id, @RequestBody Map<String, Boolean> body) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        Optional<Fattura> fatturaOptional = fatturaRepository.findById(safeId);
        if (fatturaOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Fattura fattura = fatturaOptional.get();
        Boolean pagato = body.get("pagata");
        if (pagato != null) {
            fattura.setPagata(pagato);
        } else {
            // Toggle if not specified
            fattura.setPagata(!fattura.isPagata());
        }

        Fattura updatedFattura = fatturaRepository.save(fattura);
        return ResponseEntity.ok(toDTO(updatedFattura));
    }

    // Crea fattura semplificata per una visita
    @PostMapping("/semplificata/visita/{visitaId}")
    @Transactional
    public ResponseEntity<FatturaDTO> createFatturaSemplificata(@PathVariable("visitaId") Long visitaId, 
                                                             @RequestBody(required = false) @Nullable Fattura fatturaData) {
        Long safeVisitaId = Objects.requireNonNull(visitaId, "visitaId must not be null");
        Optional<Visita> visitaOptional = visitaRepository.findById(safeVisitaId);
        if (visitaOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Visita visita = visitaOptional.get();
        
        Fattura fattura = new Fattura();
        fattura.setVisita(visita);
        
        // Try to get proprietario from animale if available, otherwise set to null
        if (visita.getAnimale() != null && visita.getAnimale().getProprietario() != null) {
            fattura.setProprietario(visita.getAnimale().getProprietario());
        } else {
            fattura.setProprietario(null);
        }
        fattura.setTipoFattura("Semplificata");
        // Calcola importo totale: priorità a request body, poi prestazioni, altrimenti default
        if (fatturaData != null && fatturaData.getImportoTotale() != null) {
            fattura.setImportoTotale(fatturaData.getImportoTotale());
        } else if (visita.getPrestazioni() != null && !visita.getPrestazioni().isEmpty()) {
            BigDecimal importoFromPrestazioni = visita.getPrestazioni().stream()
                .map(p -> p.getCostoBase() != null ? p.getCostoBase() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            fattura.setImportoTotale(importoFromPrestazioni);
        } else {
            fattura.setImportoTotale(new BigDecimal("0.00")); // Default value
        }
        
        // Genera un numero fattura unico per evitare conflitti
        fattura.setNumeroFattura("FAT-" + safeVisitaId + "-" + UUID.randomUUID().toString().substring(0, 8));
        
        // Imposta dati dal request body se disponibili, altrimenti dal proprietario (se esiste)
        Proprietario proprietario = (visita.getAnimale() != null && visita.getAnimale().getProprietario() != null) ? visita.getAnimale().getProprietario() : null;
        
        // Codice fiscale: priorità a request body, poi proprietario (se esiste)
        if (fatturaData != null && fatturaData.getCodiceFiscaleCliente() != null && !fatturaData.getCodiceFiscaleCliente().isEmpty()) {
            fattura.setCodiceFiscaleCliente(fatturaData.getCodiceFiscaleCliente());
        } else if (proprietario != null && proprietario.getCodiceFiscale() != null) {
            fattura.setCodiceFiscaleCliente(proprietario.getCodiceFiscale());
        }

        // Indirizzo: priorità a request body, poi proprietario (se esiste)
        if (fatturaData != null && fatturaData.getIndirizzoCliente() != null && !fatturaData.getIndirizzoCliente().isEmpty()) {
            fattura.setIndirizzoCliente(fatturaData.getIndirizzoCliente());
        } else if (proprietario != null && proprietario.getIndirizzo() != null) {
            fattura.setIndirizzoCliente(proprietario.getIndirizzo());
        }

        // Città: priorità a request body, poi proprietario (se esiste)
        if (fatturaData != null && fatturaData.getCittaCliente() != null && !fatturaData.getCittaCliente().isEmpty()) {
            fattura.setCittaCliente(fatturaData.getCittaCliente());
        } else if (proprietario != null && proprietario.getCitta() != null) {
            fattura.setCittaCliente(proprietario.getCitta());
        }

        // Dettaglio servizi: priorità a request body, poi tipo visita
        if (fatturaData != null && fatturaData.getDettaglioServizi() != null && !fatturaData.getDettaglioServizi().isEmpty()) {
            fattura.setDettaglioServizi(fatturaData.getDettaglioServizi());
        } else {
            // Dettaglio predefinito basato sul tipo di visita
            String tipoVisita = visita.getTipoVisita();
            if (tipoVisita != null && !tipoVisita.isEmpty()) {
                fattura.setDettaglioServizi("Servizio di " + tipoVisita);
            } else {
                fattura.setDettaglioServizi("Servizi veterinari");
            }
        }

        try {
            // Check if a fattura already exists for this visita
            List<Fattura> existingFatture = fatturaRepository.findByVisitaId(safeVisitaId);
            if (!existingFatture.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validate required fields before saving
            if (fattura.getImportoTotale() == null) {
                return ResponseEntity.badRequest().body(null);
            }
            
            Fattura savedFattura = fatturaRepository.save(fattura);
            
            // Convert to DTO before transaction closes
            FatturaDTO dto = toDTO(savedFattura);
            return ResponseEntity.status(201).body(dto);
        } catch (Exception e) {
            System.out.println("ERROR: Exception during fattura semplificata creation: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            System.out.println(sw.toString());
            return ResponseEntity.status(500).body(null);
        }
    }
}