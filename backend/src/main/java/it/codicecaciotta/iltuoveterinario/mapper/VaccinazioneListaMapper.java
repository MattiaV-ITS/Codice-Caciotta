package it.codicecaciotta.iltuoveterinario.mapper;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;

public class VaccinazioneListaMapper {
    
    public static VaccinazioneListaDTO toListaDTO(Vaccinazione vaccinazione) {
        if (vaccinazione == null) return null;

        VaccinazioneListaDTO dto = new VaccinazioneListaDTO();
        dto.setId(vaccinazione.getId());
        dto.setTipoVaccino(vaccinazione.getTipoVaccino());
        dto.setDataScadenza(vaccinazione.getDataScadenza());
        dto.setStato(vaccinazione.getStato());
        
        if (vaccinazione.getAnimale() != null) {
            dto.setNomeAnimale(vaccinazione.getAnimale().getNome());
            dto.setAnimaleId(vaccinazione.getAnimale().getId());
        }

        return dto;
    }
}