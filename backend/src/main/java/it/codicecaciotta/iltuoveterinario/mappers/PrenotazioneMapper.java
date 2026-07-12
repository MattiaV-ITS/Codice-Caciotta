package it.codicecaciotta.iltuoveterinario.mappers;

import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrenotazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;

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
        
        // Fetch and set Animale entity
        if (dto.getAnimaleId() != null) {
            Animale animale = animaleRepository.findById(dto.getAnimaleId())
                    .orElseThrow(() -> new RuntimeException("Animale not found with id: " + dto.getAnimaleId()));
            prenotazione.setAnimale(animale);
        } else {
            throw new RuntimeException("animaleId cannot be null");
        }
        
        // Fetch and set Proprietario entity
        if (dto.getProprietarioId() != null) {
            Proprietario proprietario = proprietarioRepository.findById(dto.getProprietarioId())
                    .orElseThrow(() -> new RuntimeException("Proprietario not found with id: " + dto.getProprietarioId()));
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
        
        // Fetch and set Animale entity
        if (dto.getAnimaleId() != null) {
            Animale animale = animaleRepository.findById(dto.getAnimaleId())
                    .orElseThrow(() -> new RuntimeException("Animale not found with id: " + dto.getAnimaleId()));
            prenotazione.setAnimale(animale);
        } else {
            throw new RuntimeException("animaleId cannot be null");
        }
        
        // Fetch and set Proprietario entity
        if (dto.getProprietarioId() != null) {
            Proprietario proprietario = proprietarioRepository.findById(dto.getProprietarioId())
                    .orElseThrow(() -> new RuntimeException("Proprietario not found with id: " + dto.getProprietarioId()));
            prenotazione.setProprietario(proprietario);
        } else {
            throw new RuntimeException("proprietarioId cannot be null");
        }

        return prenotazione;
    }
}