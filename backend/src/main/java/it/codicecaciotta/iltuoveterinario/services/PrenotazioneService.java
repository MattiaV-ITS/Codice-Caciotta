package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import it.codicecaciotta.iltuoveterinario.repositories.DiarioClinicoRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrenotazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VisitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PrenotazioneService {

    private final PrenotazioneRepository prenotazioneRepository;

    private final VisitaRepository visitaRepository;

    private final DiarioClinicoRepository diarioClinicoRepository;

    PrenotazioneService(PrenotazioneRepository prenotazioneRepository, VisitaRepository visitaRepository, DiarioClinicoRepository diarioClinicoRepository) {
        this.prenotazioneRepository = prenotazioneRepository;
        this.visitaRepository = visitaRepository;
        this.diarioClinicoRepository = diarioClinicoRepository;
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getAllPrenotazioni() {
        return prenotazioneRepository.findAllWithRelationships();
    }

    @Transactional(readOnly = true)
    public Optional<Prenotazione> getPrenotazioneById(Long id) {
        return prenotazioneRepository.findByIdWithRelationships(id);
    }

    @Transactional
    public Prenotazione createPrenotazione(Prenotazione prenotazione) {
        prenotazione.setDataPrenotazione(LocalDateTime.now());
        return prenotazioneRepository.save(prenotazione);
    }

    @Transactional
    public Prenotazione updatePrenotazione(Long id, Prenotazione prenotazioneDetails) {
        return prenotazioneRepository.findById(id)
                .map(prenotazione -> {
                    prenotazione.setDataOraAppuntamento(prenotazioneDetails.getDataOraAppuntamento());
                    prenotazione.setTipoVisita(prenotazioneDetails.getTipoVisita());
                    prenotazione.setNote(prenotazioneDetails.getNote());
                    prenotazione.setAnimale(prenotazioneDetails.getAnimale());
                    prenotazione.setProprietario(prenotazioneDetails.getProprietario());
                    return prenotazioneRepository.save(prenotazione);
                })
                .orElseThrow(() -> new RuntimeException("Prenotazione non trovata con id: " + id));
    }

    @Transactional
    public void deletePrenotazione(Long id) {
        prenotazioneRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByAnimale(Long animaleId) {
        return prenotazioneRepository.findByAnimaleId(animaleId);
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByProprietario(Long proprietarioId) {
        return prenotazioneRepository.findByProprietarioId(proprietarioId);
    }

    @Transactional(readOnly = true)
    public List<Prenotazione> getPrenotazioniByDateRange(String startDate, String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        return prenotazioneRepository.findByDataOraAppuntamentoBetween(start, end);
    }

    @Transactional
    public Optional<Visita> createVisitaFromPrenotazione(Long prenotazioneId) {
        return prenotazioneRepository.findByIdWithRelationships(prenotazioneId)
                .map(prenotazione -> {
                    // Check if visita already exists
                    if (prenotazione.getVisita() != null) {
                        return prenotazione.getVisita();
                    }

                    // Create new visita from prenotazione
                    Visita visita = new Visita();
                    visita.setDataOraVisita(prenotazione.getDataOraAppuntamento());
                    visita.setTipoVisita(prenotazione.getTipoVisita());
                    visita.setAnimale(prenotazione.getAnimale());
                    visita.setPrenotazione(prenotazione);
                    visita.setImportoTotale(java.math.BigDecimal.ZERO);
                    visita.setDurata(30); // Default duration

                    Visita savedVisita = visitaRepository.save(visita);
                    
                    // Create and save DiarioClinico for the visita
                    DiarioClinico diarioClinico = new DiarioClinico();
                    diarioClinico.setVisita(savedVisita);
                    diarioClinico.setSintomi(""); // Empty default values
                    diarioClinico.setDiagnosi("");
                    diarioClinico.setTrattamentoTerapia("");
                    diarioClinico.setNote("");
                    diarioClinico.setNotePrivate("");
                    diarioClinicoRepository.save(diarioClinico);

                    prenotazione.setVisita(savedVisita);
                    prenotazioneRepository.save(prenotazione);

                    return savedVisita;
                });
    }

    @Transactional(readOnly = true)
    public Optional<Visita> getVisitaForPrenotazione(Long prenotazioneId) {
        return prenotazioneRepository.findByIdWithRelationships(prenotazioneId)
                .map(Prenotazione::getVisita);
    }
}