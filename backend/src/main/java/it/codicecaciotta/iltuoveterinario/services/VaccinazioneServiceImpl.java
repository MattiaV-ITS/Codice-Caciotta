package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.EStatoVaccinazione;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        vaccinazione.setNote(vaccinazioneCreateDTO.getNote());
        vaccinazione.setAnimale(animale);

        animale.addVaccinazione(vaccinazione);

        return vaccinazioneRepository.save(vaccinazione);
    }

    @Override
    public Vaccinazione updateVaccinazione(@NonNull Long id, VaccinazioneUpdateDTO vaccinazioneUpdateDTO) {
        Vaccinazione vaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione non trovata con ID: " + id));

        if (vaccinazioneUpdateDTO.getTipoVaccino() != null) {
            vaccinazione.setTipoVaccino(vaccinazioneUpdateDTO.getTipoVaccino());
        }
        if (vaccinazioneUpdateDTO.getDataSomministrazione() != null) {
            vaccinazione.setDataSomministrazione(vaccinazioneUpdateDTO.getDataSomministrazione());
        }
        if (vaccinazioneUpdateDTO.getDataScadenza() != null) {
            vaccinazione.setDataScadenza(vaccinazioneUpdateDTO.getDataScadenza());
        }
        if (vaccinazioneUpdateDTO.getLotto() != null) {
            vaccinazione.setLotto(vaccinazioneUpdateDTO.getLotto());
        }
        if (vaccinazioneUpdateDTO.getNote() != null) {
            vaccinazione.setNote(vaccinazioneUpdateDTO.getNote());
        }

        return vaccinazioneRepository.save(vaccinazione);
    }

    @Override
    public void deleteVaccinazione(@NonNull Long id) {
        Vaccinazione vaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione not found with ID: " + id));

        // Rimuovi la vaccinazione dall'animale
        if (vaccinazione.getAnimale() != null) {
            vaccinazione.getAnimale().removeVaccinazione(vaccinazione);
        }

        vaccinazioneRepository.delete(vaccinazione);
    }

    @Override
    public Vaccinazione getVaccinazioneById(@NonNull Long id) {
        return vaccinazioneRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Vaccinazione not found with ID: " + id));
    }

    @Override
    public List<Vaccinazione> getVaccinazioniByAnimaleId(@NonNull Long animaleId) {
        Animale animale = animaleRepository.findById(animaleId)
                .orElseThrow(() -> new NoSuchElementException("Animale not found with ID: " + animaleId));

        return vaccinazioneRepository.findByAnimaleOrderByDataScadenzaAsc(animale);
    }

    @Override
    public List<Vaccinazione> getAllVaccinazioni() {
        return vaccinazioneRepository.findAll();
    }

    @Override
    public Page<Vaccinazione> getAllVaccinazioni(Pageable pageable) {
        return vaccinazioneRepository.findAll(pageable);
    }

    @Override
    public EStatoVaccinazione calculateStatoVaccinazione(Vaccinazione vaccinazione) {
        if (vaccinazione == null || vaccinazione.getDataScadenza() == null) {
            return EStatoVaccinazione.SCADUTO;
        }

        LocalDate oggi = LocalDate.now();
        LocalDate dataScadenza = vaccinazione.getDataScadenza();

        long giorniScadenza = java.time.temporal.ChronoUnit.DAYS.between(oggi, dataScadenza);

        if (giorniScadenza < 0) {
            return EStatoVaccinazione.SCADUTO; // Scaduto
        } else if (giorniScadenza <= 30) {
            return EStatoVaccinazione.PROSSIMO; // Scade entro 30 giorni
        } else {
            return EStatoVaccinazione.VALIDO; // Valido
        }
    }


}