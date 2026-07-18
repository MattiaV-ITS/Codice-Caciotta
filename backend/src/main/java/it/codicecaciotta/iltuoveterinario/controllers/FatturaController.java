package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.FatturaDTO;
import it.codicecaciotta.iltuoveterinario.models.Fattura;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.FatturaRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;
import java.io.StringWriter;
import java.io.PrintWriter;

@RestController
@RequestMapping("/api/fatture")
public class FatturaController {

    private final FatturaRepository fatturaRepository;

    private final VisitaRepository visitaRepository;

    FatturaController(FatturaRepository fatturaRepository, VisitaRepository visitaRepository) {
        this.fatturaRepository = fatturaRepository;
        this.visitaRepository = visitaRepository;
    }

    // Crea una nuova fattura per una visita
    @PostMapping("/visita/{visitaId}")
    @Transactional
    public ResponseEntity<FatturaDTO> createFatturaForVisita(@PathVariable Long visitaId, @RequestBody Fattura fattura) {
        Optional<Visita> visitaOptional = visitaRepository.findById(visitaId);
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

        // Calcola importo totale se non specificato (per fatture semplificate)
        if (fattura.getImportoTotale() == null && visita.getImportoTotale() != null) {
            fattura.setImportoTotale(visita.getImportoTotale());
        }

        // Ora solo fatture semplificate - imposta tipo fisso
        fattura.setTipoFattura("Semplificata");
        
        // Genera numero fattura unico se non fornito
        if (fattura.getNumeroFattura() == null || fattura.getNumeroFattura().isEmpty()) {
            fattura.setNumeroFattura("FAT-" + visitaId + "-" + UUID.randomUUID().toString().substring(0, 8));
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
            
            // Debug logging
            System.out.println("DEBUG: Creating fattura with:");
            System.out.println("  - Visita ID: " + (fattura.getVisita() != null ? fattura.getVisita().getId() : "null"));
            System.out.println("  - Proprietario: " + (fattura.getProprietario() != null ? "ID=" + fattura.getProprietario().getId() : "null"));
            System.out.println("  - Numero Fattura: " + fattura.getNumeroFattura());
            System.out.println("  - Importo Totale: " + fattura.getImportoTotale());
            System.out.println("  - Codice Fiscale: " + fattura.getCodiceFiscaleCliente());
            System.out.println("  - Tipo Fattura: " + fattura.getTipoFattura());
            
            Fattura savedFattura = fatturaRepository.save(fattura);
            System.out.println("DEBUG: Fattura saved successfully with ID: " + savedFattura.getId());
            System.out.println("DEBUG: Attempting to initialize lazy relationships...");
            // Force initialization of lazy-loaded relationships BEFORE returning
            if (savedFattura.getVisita() != null) {
                System.out.println("DEBUG: Visita ID: " + savedFattura.getVisita().getId());
            }
            if (savedFattura.getProprietario() != null) {
                System.out.println("DEBUG: Proprietario ID: " + savedFattura.getProprietario().getId());
            }
            System.out.println("DEBUG: About to return ResponseEntity");
            
            // Convert to DTO before returning
            FatturaDTO dto = new FatturaDTO(
                savedFattura.getId(),
                savedFattura.getNumeroFattura(),
                savedFattura.getImportoTotale(),
                savedFattura.getTipoFattura(),
                savedFattura.getDettaglioServizi(),
                savedFattura.getCodiceFiscaleCliente(),
                savedFattura.getIndirizzoCliente(),
                savedFattura.getCittaCliente(),
                savedFattura.getMetodoPagamento(),
                savedFattura.getDataEmissione(),
                savedFattura.getVisita() != null ? savedFattura.getVisita().getId() : null,
                savedFattura.getProprietario() != null ? savedFattura.getProprietario().getId() : null
            );
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
    public ResponseEntity<FatturaDTO> getFattura(@PathVariable Long id) {
        Optional<Fattura> fattura = fatturaRepository.findById(id);
        if (fattura.isPresent()) {
            Fattura f = fattura.get();
            // Force initialization of lazy-loaded relationships
            if (f.getVisita() != null) f.getVisita().getId();
            if (f.getProprietario() != null) f.getProprietario().getId();
            
            // Convert to DTO
            FatturaDTO dto = new FatturaDTO(
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
                f.getProprietario() != null ? f.getProprietario().getId() : null
            );
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.notFound().build();
    }

    // Ottieni fatture per visita
    @GetMapping("/visita/{visitaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FatturaDTO>> getFattureByVisita(@PathVariable Long visitaId) {
        List<Fattura> fatture = fatturaRepository.findByVisitaId(visitaId);
        List<FatturaDTO> fattureDTO = new java.util.ArrayList<>();
        for (Fattura f : fatture) {
            if (f.getVisita() != null) f.getVisita().getId();
            if (f.getProprietario() != null) f.getProprietario().getId();
            
            // Convert to DTO
            FatturaDTO dto = new FatturaDTO(
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
                f.getProprietario() != null ? f.getProprietario().getId() : null
            );
            fattureDTO.add(dto);
        }
        return ResponseEntity.ok(fattureDTO);
    }

    // Aggiorna una fattura
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<FatturaDTO> updateFattura(@PathVariable Long id, @RequestBody Fattura fatturaDetails) {
        Optional<Fattura> fatturaOptional = fatturaRepository.findById(id);
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
        // Force initialization of lazy-loaded relationships
        if (updatedFattura.getVisita() != null) updatedFattura.getVisita().getId();
        if (updatedFattura.getProprietario() != null) updatedFattura.getProprietario().getId();
        
        // Convert to DTO
        FatturaDTO dto = new FatturaDTO(
            updatedFattura.getId(),
            updatedFattura.getNumeroFattura(),
            updatedFattura.getImportoTotale(),
            updatedFattura.getTipoFattura(),
            updatedFattura.getDettaglioServizi(),
            updatedFattura.getCodiceFiscaleCliente(),
            updatedFattura.getIndirizzoCliente(),
            updatedFattura.getCittaCliente(),
            updatedFattura.getMetodoPagamento(),
            updatedFattura.getDataEmissione(),
            updatedFattura.getVisita() != null ? updatedFattura.getVisita().getId() : null,
            updatedFattura.getProprietario() != null ? updatedFattura.getProprietario().getId() : null
        );
        return ResponseEntity.ok(dto);
    }

    // Elimina una fattura
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteFattura(@PathVariable Long id) {
        Optional<Fattura> fattura = fatturaRepository.findById(id);
        if (fattura.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        fatturaRepository.delete(fattura.get());
        return ResponseEntity.noContent().build();
    }

    // Crea fattura semplificata per una visita
    @PostMapping("/semplificata/visita/{visitaId}")
    @Transactional
    public ResponseEntity<FatturaDTO> createFatturaSemplificata(@PathVariable Long visitaId, 
                                                             @RequestBody(required = false) Fattura fatturaData) {
        Optional<Visita> visitaOptional = visitaRepository.findById(visitaId);
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
        // Use visita importo totale if available, otherwise set a default value
        if (visita.getImportoTotale() != null) {
            fattura.setImportoTotale(visita.getImportoTotale());
        } else {
            fattura.setImportoTotale(new BigDecimal("0.00")); // Default value
        }
        
        // Genera un numero fattura unico per evitare conflitti
        fattura.setNumeroFattura("FAT-" + visitaId + "-" + UUID.randomUUID().toString().substring(0, 8));
        
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
            List<Fattura> existingFatture = fatturaRepository.findByVisitaId(visitaId);
            if (!existingFatture.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validate required fields before saving
            if (fattura.getImportoTotale() == null) {
                return ResponseEntity.badRequest().body(null);
            }
            
            // Debug logging
            System.out.println("DEBUG: Creating fattura semplificata with:");
            System.out.println("  - Visita ID: " + (fattura.getVisita() != null ? fattura.getVisita().getId() : "null"));
            System.out.println("  - Proprietario: " + (fattura.getProprietario() != null ? "ID=" + fattura.getProprietario().getId() : "null"));
            System.out.println("  - Numero Fattura: " + fattura.getNumeroFattura());
            System.out.println("  - Importo Totale: " + fattura.getImportoTotale());
            System.out.println("  - Codice Fiscale: " + fattura.getCodiceFiscaleCliente());
            System.out.println("  - Tipo Fattura: " + fattura.getTipoFattura());
            System.out.println("  - Dettaglio Servizi: " + fattura.getDettaglioServizi());
            
            Fattura savedFattura = fatturaRepository.save(fattura);
            System.out.println("DEBUG: Fattura saved successfully with ID: " + savedFattura.getId());
            System.out.flush();
            
            // Convert to DTO before transaction closes
            FatturaDTO dto = new FatturaDTO(
                savedFattura.getId(),
                savedFattura.getNumeroFattura(),
                savedFattura.getImportoTotale(),
                savedFattura.getTipoFattura(),
                savedFattura.getDettaglioServizi(),
                savedFattura.getCodiceFiscaleCliente(),
                savedFattura.getIndirizzoCliente(),
                savedFattura.getCittaCliente(),
                savedFattura.getMetodoPagamento(),
                savedFattura.getDataEmissione(),
                savedFattura.getVisita() != null ? savedFattura.getVisita().getId() : null,
                savedFattura.getProprietario() != null ? savedFattura.getProprietario().getId() : null
            );
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
