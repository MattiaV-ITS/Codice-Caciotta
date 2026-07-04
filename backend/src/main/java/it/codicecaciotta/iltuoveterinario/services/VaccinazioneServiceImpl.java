package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.EVaccinationStatus;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class VaccinazioneServiceImpl implements VaccinazioneService {

    private final VaccinazioneRepository vaccinazioneRepository;
    private final AnimaleRepository animaleRepository;

    public VaccinazioneServiceImpl(VaccinazioneRepository vaccinazioneRepository, AnimaleRepository animaleRepository) {
        this.vaccinazioneRepository = vaccinazioneRepository;
        this.animaleRepository = animaleRepository;
    }

    @Override
    public Vaccinazione createVaccinazione(VaccinazioneCreateDTO vaccinazioneCreateDTO) {
        Animale animale = animaleRepository.findById(vaccinazioneCreateDTO.getAnimaleId())
                .orElseThrow(() -> new NoSuchElementException("Animale non trovato con ID: " + vaccinazioneCreateDTO.getAnimaleId()));

        Vaccinazione vaccinazione = new Vaccinazione();
        vaccinazione.setTipoVaccino(vaccinazioneCreateDTO.getTipoVaccino());
        vaccinazione.setDataSomministrazione(vaccinazioneCreateDTO.getDataSomministrazione());
        vaccinazione.setDataScadenza(vaccinazioneCreateDTO.getDataScadenza());
        vaccinazione.setLotto(vaccinazioneCreateDTO.getLotto());
        vaccinazione.setStato(vaccinazioneCreateDTO.getStato());
        vaccinazione.setNote(vaccinazioneCreateDTO.getNote());
        vaccinazione.setAnimale(animale);

        // Aggiungi la vaccinazione all'animale
        animale.addVaccinazione(vaccinazione);

        return vaccinazioneRepository.save(vaccinazione);
    }

    @Override
    public Vaccinazione updateVaccinazione(@NonNull Long id, VaccinazioneUpdateDTO vaccinazioneUpdateDTO) {
        Vaccinazione existingVaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione non trovata con ID: " + id));

        if (vaccinazioneUpdateDTO.getTipoVaccino() != null) {
            existingVaccinazione.setTipoVaccino(vaccinazioneUpdateDTO.getTipoVaccino());
        }
        if (vaccinazioneUpdateDTO.getDataSomministrazione() != null) {
            existingVaccinazione.setDataSomministrazione(vaccinazioneUpdateDTO.getDataSomministrazione());
        }
        if (vaccinazioneUpdateDTO.getDataScadenza() != null) {
            existingVaccinazione.setDataScadenza(vaccinazioneUpdateDTO.getDataScadenza());
        }
        if (vaccinazioneUpdateDTO.getLotto() != null) {
            existingVaccinazione.setLotto(vaccinazioneUpdateDTO.getLotto());
        }
        if (vaccinazioneUpdateDTO.getStato() != null) {
            existingVaccinazione.setStato(vaccinazioneUpdateDTO.getStato());
        }
        if (vaccinazioneUpdateDTO.getNote() != null) {
            existingVaccinazione.setNote(vaccinazioneUpdateDTO.getNote());
        }

        return vaccinazioneRepository.save(existingVaccinazione);
    }

    @Override
    public void deleteVaccinazione(@NonNull Long id) {
        Vaccinazione vaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione non trovata con ID: " + id));

        // Rimuovi la vaccinazione dall'animale
        if (vaccinazione.getAnimale() != null) {
            vaccinazione.getAnimale().removeVaccinazione(vaccinazione);
        }

        vaccinazioneRepository.delete(vaccinazione);
    }

    @Override
    public Vaccinazione getVaccinazioneById(@NonNull Long id) {
        return vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione non trovata con ID: " + id));
    }

    @Override
    public List<Vaccinazione> getVaccinazioniByAnimaleId(@NonNull Long animaleId) {
        Animale animale = animaleRepository.findById(animaleId)
                .orElseThrow(() -> new NoSuchElementException("Animale non trovato con ID: " + animaleId));

        return vaccinazioneRepository.findByAnimaleOrderByDataScadenzaAsc(animale);
    }

    @Override
    public List<Vaccinazione> getAllVaccinazioni() {
        return vaccinazioneRepository.findAll();
    }

    @Override
    public List<Vaccinazione> getVaccinazioniScadute() {
        return vaccinazioneRepository.findByStato(EVaccinationStatus.SCADUTO);
    }

    @Override
    public List<Vaccinazione> getVaccinazioniInScadenza() {
        // Vaccinazioni che scadono entro 30 giorni
        LocalDate dataLimite = LocalDate.now().plusDays(30);
        return vaccinazioneRepository.findByDataScadenzaBefore(dataLimite);
    }
}