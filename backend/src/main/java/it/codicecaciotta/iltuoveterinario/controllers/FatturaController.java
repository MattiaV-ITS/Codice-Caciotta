package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.models.Fattura;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.FatturaRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<Fattura> createFatturaForVisita(@PathVariable Long visitaId, @RequestBody Fattura fattura) {
        Optional<Visita> visitaOptional = visitaRepository.findById(visitaId);
        if (visitaOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Visita visita = visitaOptional.get();
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
            fattura.setNumeroFattura("FAT-" + System.currentTimeMillis());
        }

        // Imposta codice fiscale dal proprietario se non già impostato
        if (fattura.getCodiceFiscaleCliente() == null && visita.getAnimale().getProprietario().getCodiceFiscale() != null) {
            fattura.setCodiceFiscaleCliente(visita.getAnimale().getProprietario().getCodiceFiscale());
        }

        // Imposta indirizzo e città dal proprietario se non già impostati
        Proprietario proprietario = visita.getAnimale().getProprietario();
        if (fattura.getIndirizzoCliente() == null && proprietario.getIndirizzo() != null) {
            fattura.setIndirizzoCliente(proprietario.getIndirizzo());
        }
        if (fattura.getCittaCliente() == null && proprietario.getCitta() != null) {
            fattura.setCittaCliente(proprietario.getCitta());
        }

        try {
            Fattura savedFattura = fatturaRepository.save(fattura);
            return ResponseEntity.ok(savedFattura);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Ottieni fattura per ID
    @GetMapping("/{id}")
    public ResponseEntity<Fattura> getFattura(@PathVariable Long id) {
        Optional<Fattura> fattura = fatturaRepository.findById(id);
        return fattura.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Ottieni fatture per visita
    @GetMapping("/visita/{visitaId}")
    public ResponseEntity<List<Fattura>> getFattureByVisita(@PathVariable Long visitaId) {
        List<Fattura> fatture = fatturaRepository.findByVisitaId(visitaId);
        return ResponseEntity.ok(fatture);
    }

    // Aggiorna una fattura
    @PutMapping("/{id}")
    public ResponseEntity<Fattura> updateFattura(@PathVariable Long id, @RequestBody Fattura fatturaDetails) {
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
        return ResponseEntity.ok(updatedFattura);
    }

    // Elimina una fattura
    @DeleteMapping("/{id}")
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
    public ResponseEntity<Fattura> createFatturaSemplificata(@PathVariable Long visitaId, 
                                                             @RequestBody(required = false) Fattura fatturaData) {
        Optional<Visita> visitaOptional = visitaRepository.findById(visitaId);
        if (visitaOptional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Visita visita = visitaOptional.get();
        Fattura fattura = new Fattura();
        fattura.setVisita(visita);
        fattura.setProprietario(visita.getAnimale().getProprietario());
        fattura.setTipoFattura("Semplificata");
        fattura.setImportoTotale(visita.getImportoTotale());
        
        // Genera un numero fattura unico per evitare conflitti
        fattura.setNumeroFattura("FAT-" + System.currentTimeMillis());
        
        // Imposta dati dal request body se disponibili, altrimenti dal proprietario
        Proprietario proprietario = visita.getAnimale().getProprietario();
        
        // Codice fiscale: priorità a request body, poi proprietario
        if (fatturaData != null && fatturaData.getCodiceFiscaleCliente() != null && !fatturaData.getCodiceFiscaleCliente().isEmpty()) {
            fattura.setCodiceFiscaleCliente(fatturaData.getCodiceFiscaleCliente());
        } else if (proprietario.getCodiceFiscale() != null) {
            fattura.setCodiceFiscaleCliente(proprietario.getCodiceFiscale());
        }

        // Indirizzo: priorità a request body, poi proprietario
        if (fatturaData != null && fatturaData.getIndirizzoCliente() != null && !fatturaData.getIndirizzoCliente().isEmpty()) {
            fattura.setIndirizzoCliente(fatturaData.getIndirizzoCliente());
        } else if (proprietario.getIndirizzo() != null) {
            fattura.setIndirizzoCliente(proprietario.getIndirizzo());
        }

        // Città: priorità a request body, poi proprietario
        if (fatturaData != null && fatturaData.getCittaCliente() != null && !fatturaData.getCittaCliente().isEmpty()) {
            fattura.setCittaCliente(fatturaData.getCittaCliente());
        } else if (proprietario.getCitta() != null) {
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
            Fattura savedFattura = fatturaRepository.save(fattura);
            return ResponseEntity.ok(savedFattura);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}