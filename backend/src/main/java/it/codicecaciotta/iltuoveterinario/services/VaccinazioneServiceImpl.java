package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.EStatoVaccinazione;
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

    public VaccinazioneServiceImpl(
            VaccinazioneRepository vaccinazioneRepository,
            AnimaleRepository animaleRepository) {

        this.vaccinazioneRepository = vaccinazioneRepository;
        this.animaleRepository = animaleRepository;
    }

    @Override
    public Vaccinazione createVaccinazione(VaccinazioneCreateDTO dto) {

        Animale animale = animaleRepository.findById(dto.getAnimaleId())
                .orElseThrow(() ->
                        new NoSuchElementException("Animale non trovato con ID: " + dto.getAnimaleId()));

        Vaccinazione vaccinazione = new Vaccinazione();
        vaccinazione.setTipoVaccino(dto.getTipoVaccino());
        vaccinazione.setDataSomministrazione(dto.getDataSomministrazione());
        vaccinazione.setDataScadenza(dto.getDataScadenza());
        vaccinazione.setLotto(dto.getLotto());
        vaccinazione.setNote(dto.getNote());
        vaccinazione.setAnimale(animale);

        animale.addVaccinazione(vaccinazione);

        return vaccinazioneRepository.save(vaccinazione);
    }

    @Override
    public Vaccinazione updateVaccinazione(@NonNull Long id, VaccinazioneUpdateDTO dto) {

        Vaccinazione vaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Vaccinazione non trovata con ID: " + id));

        if (dto.getTipoVaccino() != null)
            vaccinazione.setTipoVaccino(dto.getTipoVaccino());

        if (dto.getDataSomministrazione() != null)
            vaccinazione.setDataSomministrazione(dto.getDataSomministrazione());

        if (dto.getDataScadenza() != null)
            vaccinazione.setDataScadenza(dto.getDataScadenza());

        if (dto.getLotto() != null)
            vaccinazione.setLotto(dto.getLotto());

        if (dto.getNote() != null)
            vaccinazione.setNote(dto.getNote());

        return vaccinazioneRepository.save(vaccinazione);
    }

    @Override
    public void deleteVaccinazione(@NonNull Long id) {

        Vaccinazione vaccinazione = vaccinazioneRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Vaccinazione non trovata con ID: " + id));

        if (vaccinazione.getAnimale() != null) {
            vaccinazione.getAnimale().removeVaccinazione(vaccinazione);
        }

        vaccinazioneRepository.delete(vaccinazione);
    }

    @Override
    public Vaccinazione getVaccinazioneById(@NonNull Long id) {

        return vaccinazioneRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("Vaccinazione non trovata con ID: " + id));
    }

    @Override
    public List<Vaccinazione> getVaccinazioniByAnimaleId(@NonNull Long animaleId) {

        Animale animale = animaleRepository.findById(animaleId)
                .orElseThrow(() ->
                        new NoSuchElementException("Animale non trovato con ID: " + animaleId));

        return vaccinazioneRepository.findByAnimaleOrderByDataScadenzaAsc(animale);
    }

    @Override
    public List<Vaccinazione> getAllVaccinazioni() {
        return vaccinazioneRepository.findAll();
    }

    @Override
    public EStatoVaccinazione calculateStatoVaccinazione(Vaccinazione vaccinazione) {

        if (vaccinazione == null || vaccinazione.getDataScadenza() == null) {
            return EStatoVaccinazione.SCADUTO;
        }

        LocalDate oggi = LocalDate.now();
        LocalDate scadenza = vaccinazione.getDataScadenza();

        long giorni = java.time.temporal.ChronoUnit.DAYS.between(oggi, scadenza);

        if (giorni < 0) return EStatoVaccinazione.SCADUTO;
        if (giorni <= 30) return EStatoVaccinazione.PROSSIMO;
        return EStatoVaccinazione.VALIDO;
    }
}
