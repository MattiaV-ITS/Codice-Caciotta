package it.codicecaciotta.iltuoveterinario.mappers;

import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.EStatoPrenotazione;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;

import java.util.Objects;

public class PrenotazioneMapper {
    public static PrenotazioneDTO toDTO(Prenotazione prenotazione) {
        if (prenotazione == null)
            return null;

        PrenotazioneDTO dto = new PrenotazioneDTO();
        dto.setId(prenotazione.getId());
        dto.setDataPrenotazione(prenotazione.getDataPrenotazione());
        dto.setDataOraAppuntamento(prenotazione.getDataOraAppuntamento());
        dto.setTipoVisita(prenotazione.getTipoVisita());
        dto.setNote(prenotazione.getNote());
        dto.setStato(prenotazione.getStato() != null ? prenotazione.getStato().name() : "NON_ARRIVATO");
        
        // Handle animale relationship safely
        if (prenotazione.getAnimale() != null) {
            dto.setAnimaleId(prenotazione.getAnimale().getId());
            dto.setAnimaleNome(prenotazione.getAnimale().getNome() != null ? prenotazione.getAnimale().getNome() : "Sconosciuto");
        } else {
            dto.setAnimaleNome("Sconosciuto");
        }
        
        // Handle proprietario relationship safely
        if (prenotazione.getProprietario() != null) {
            dto.setProprietarioId(prenotazione.getProprietario().getId());
            dto.setProprietarioNome(prenotazione.getProprietario().getNome() != null ? prenotazione.getProprietario().getNome() : "Sconosciuto");
            dto.setProprietarioCognome(prenotazione.getProprietario().getCognome() != null ? prenotazione.getProprietario().getCognome() : "");
        } else {
            dto.setProprietarioNome("Sconosciuto");
            dto.setProprietarioCognome("");
        }

        return dto;
    }

    public static Prenotazione toEntity(PrenotazioneDTO dto, AnimaleRepository animaleRepository, ProprietarioRepository proprietarioRepository) {
        if (dto == null)
            return null;

        // Validate repositories
        if (animaleRepository == null || proprietarioRepository == null) {
            throw new IllegalArgumentException("Repositories cannot be null");
        }

        Prenotazione prenotazione = new Prenotazione();
        prenotazione.setDataOraAppuntamento(dto.getDataOraAppuntamento());
        prenotazione.setTipoVisita(dto.getTipoVisita());
        prenotazione.setNote(dto.getNote());
        prenotazione.setStato(dto.getStato() != null ? EStatoPrenotazione.valueOf(dto.getStato()) : EStatoPrenotazione.NON_ARRIVATO);
        
        // Fetch and set Animale entity
        if (dto.getAnimaleId() != null) {
            Long animaleId = Objects.requireNonNull(dto.getAnimaleId(), "animaleId cannot be null");
            Animale animale = animaleRepository.findById(animaleId)
                    .orElseThrow(() -> new RuntimeException("Animale not found with id: " + animaleId));
            prenotazione.setAnimale(animale);
        } else {
            throw new RuntimeException("animaleId cannot be null");
        }
        
        // Fetch and set Proprietario entity
        if (dto.getProprietarioId() != null) {
            Long proprietarioId = Objects.requireNonNull(dto.getProprietarioId(), "proprietarioId cannot be null");
            Proprietario proprietario = proprietarioRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietario not found with id: " + proprietarioId));
            prenotazione.setProprietario(proprietario);
        } else {
            throw new RuntimeException("proprietarioId cannot be null");
        }

        return prenotazione;
    }

    public static Prenotazione toEntity(PrenotazioneUpdateDTO dto, AnimaleRepository animaleRepository, ProprietarioRepository proprietarioRepository) {
        if (dto == null)
            return null;

        // Validate repositories
        if (animaleRepository == null || proprietarioRepository == null) {
            throw new IllegalArgumentException("Repositories cannot be null");
        }

        Prenotazione prenotazione = new Prenotazione();
        prenotazione.setDataOraAppuntamento(dto.getDataOraAppuntamento());
        prenotazione.setTipoVisita(dto.getTipoVisita());
        prenotazione.setNote(dto.getNote());
        prenotazione.setStato(dto.getStato() != null ? EStatoPrenotazione.valueOf(dto.getStato()) : EStatoPrenotazione.NON_ARRIVATO);
        
        // Fetch and set Animale entity
        if (dto.getAnimaleId() != null) {
            Long animaleId = java.util.Objects.requireNonNull(dto.getAnimaleId(), "animaleId cannot be null");
            Animale animale = animaleRepository.findById(animaleId)
                    .orElseThrow(() -> new RuntimeException("Animale not found with id: " + animaleId));
            prenotazione.setAnimale(animale);
        } else {
            throw new RuntimeException("animaleId cannot be null");
        }
        
        // Fetch and set Proprietario entity
        if (dto.getProprietarioId() != null) {
            Long proprietarioId = java.util.Objects.requireNonNull(dto.getProprietarioId(), "proprietarioId cannot be null");
            Proprietario proprietario = proprietarioRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietario not found with id: " + proprietarioId));
            prenotazione.setProprietario(proprietario);
        } else {
            throw new RuntimeException("proprietarioId cannot be null");
        }

        return prenotazione;
    }

    public static Prenotazione toEntity(PrenotazioneCreateDTO dto, AnimaleRepository animaleRepository, ProprietarioRepository proprietarioRepository) {
        if (dto == null)
            return null;

        // Validate repositories
        if (animaleRepository == null || proprietarioRepository == null) {
            throw new IllegalArgumentException("Repositories cannot be null");
        }

        Prenotazione prenotazione = new Prenotazione();
        prenotazione.setDataOraAppuntamento(dto.getDataOraAppuntamento());
        prenotazione.setTipoVisita(dto.getTipoVisita());
        prenotazione.setNote(dto.getNote());
        prenotazione.setStato(dto.getStato() != null ? EStatoPrenotazione.valueOf(dto.getStato()) : EStatoPrenotazione.NON_ARRIVATO);
        
        // Fetch and set Animale entity
        if (dto.getAnimaleId() != null) {
            Long animaleId = Objects.requireNonNull(dto.getAnimaleId(), "animaleId cannot be null");
            Animale animale = animaleRepository.findById(animaleId)
                    .orElseThrow(() -> new RuntimeException("Animale not found with id: " + animaleId));
            prenotazione.setAnimale(animale);
        } else {
            throw new RuntimeException("animaleId cannot be null");
        }
        
        // Fetch and set Proprietario entity
        if (dto.getProprietarioId() != null) {
            Long proprietarioId = Objects.requireNonNull(dto.getProprietarioId(), "proprietarioId cannot be null");
            Proprietario proprietario = proprietarioRepository.findById(proprietarioId)
                    .orElseThrow(() -> new RuntimeException("Proprietario not found with id: " + proprietarioId));
            prenotazione.setProprietario(proprietario);
        } else {
            throw new RuntimeException("proprietarioId cannot be null");
        }

        return prenotazione;
    }
}