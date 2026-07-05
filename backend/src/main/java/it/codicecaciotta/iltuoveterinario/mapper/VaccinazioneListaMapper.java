package it.codicecaciotta.iltuoveterinario.mapper;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.models.EStatoVaccinazione;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneService;
import org.springframework.stereotype.Component;

@Component
public class VaccinazioneListaMapper {
    
    private final VaccinazioneService vaccinazioneService;
    
    public VaccinazioneListaMapper(VaccinazioneService vaccinazioneService) {
        this.vaccinazioneService = vaccinazioneService;
    }
    
    public VaccinazioneListaDTO toListaDTO(Vaccinazione vaccinazione) {
        if (vaccinazione == null) return null;

        VaccinazioneListaDTO dto = new VaccinazioneListaDTO();
        dto.setId(vaccinazione.getId());
        dto.setLotto(vaccinazione.getLotto());
        dto.setTipoVaccino(vaccinazione.getTipoVaccino());
        dto.setDataSomministrazione(vaccinazione.getDataSomministrazione());
        dto.setDataScadenza(vaccinazione.getDataScadenza());

        // Calculate vaccination status dynamically
        EStatoVaccinazione status = vaccinazioneService.calculateStatoVaccinazione(vaccinazione);
        dto.setStatoVaccinazione(status);

        dto.setNomeAnimale(vaccinazione.getAnimale().getNome());
        dto.setAnimaleId(vaccinazione.getAnimale().getId());

        return dto;
    }
}