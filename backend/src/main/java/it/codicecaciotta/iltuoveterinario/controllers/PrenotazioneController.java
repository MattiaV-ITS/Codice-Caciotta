package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneDTO;
import it.codicecaciotta.iltuoveterinario.mappers.PrenotazioneMapper;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.services.PrenotazioneService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/prenotazioni")
public class PrenotazioneController {

    private final PrenotazioneService prenotazioneService;
    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;

    PrenotazioneController(PrenotazioneService prenotazioneService, 
                          AnimaleRepository animaleRepository, 
                          ProprietarioRepository proprietarioRepository) {
        this.prenotazioneService = prenotazioneService;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<PrenotazioneDTO>> getAllPrenotazioni() {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getAllPrenotazioni()
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrenotazioneDTO> getPrenotazioneById(@PathVariable Long id) {
        return prenotazioneService.getPrenotazioneById(id)
                .map(PrenotazioneMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Prenotazione> createPrenotazione(@Valid @RequestBody PrenotazioneCreateDTO prenotazioneDTO) {
        try {
            Prenotazione prenotazione = PrenotazioneMapper.toEntity(prenotazioneDTO, animaleRepository, proprietarioRepository);
            return ResponseEntity.ok(prenotazioneService.createPrenotazione(prenotazione));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create prenotazione: " + e.getMessage(), e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prenotazione> updatePrenotazione(
            @PathVariable Long id, 
            @RequestBody Prenotazione prenotazioneDetails) {
        return ResponseEntity.ok(prenotazioneService.updatePrenotazione(id, prenotazioneDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrenotazione(@PathVariable Long id) {
        prenotazioneService.deletePrenotazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/animale/{animaleId}")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByAnimale(@PathVariable Long animaleId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByAnimale(animaleId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/proprietario/{proprietarioId}")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByProprietario(@PathVariable Long proprietarioId) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByProprietario(proprietarioId)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @GetMapping("/range")
    public ResponseEntity<List<PrenotazioneDTO>> getPrenotazioniByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        List<PrenotazioneDTO> prenotazioniDTO = prenotazioneService.getPrenotazioniByDateRange(startDate, endDate)
                .stream()
                .map(PrenotazioneMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(prenotazioniDTO);
    }

    @PostMapping("/{prenotazioneId}/visita")
    public ResponseEntity<?> createVisitaFromPrenotazione(@PathVariable Long prenotazioneId) {
        return prenotazioneService.createVisitaFromPrenotazione(prenotazioneId)
                .map(visita -> ResponseEntity.ok().body(Map.of("visitaId", visita.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{prenotazioneId}/visita")
    public ResponseEntity<?> getVisitaForPrenotazione(@PathVariable Long prenotazioneId) {
        return prenotazioneService.getVisitaForPrenotazione(prenotazioneId)
                .map(visita -> ResponseEntity.ok().body(Map.of("visitaId", visita.getId())))
                .orElse(ResponseEntity.ok().body(Map.of("visitaId", null)));
    }
}