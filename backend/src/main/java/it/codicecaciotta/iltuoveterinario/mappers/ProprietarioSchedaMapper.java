package it.codicecaciotta.iltuoveterinario.mappers;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioSchedaDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import java.util.List;

public class ProprietarioSchedaMapper {

    public static ProprietarioSchedaDTO toSchedaDTO(Proprietario proprietario) {
        if (proprietario == null) {
            return null;
        }

        ProprietarioSchedaDTO dto = new ProprietarioSchedaDTO();
        dto.setId(proprietario.getId());
        dto.setNome(proprietario.getNome());
        dto.setCognome(proprietario.getCognome());
        dto.setEmail(proprietario.getEmail());
        dto.setTelefono(proprietario.getTelefono());
        dto.setIndirizzo(proprietario.getIndirizzo());
        dto.setCitta(proprietario.getCitta());
        dto.setDataRegistrazione(proprietario.getDataRegistrazione());
        dto.setCodiceFiscale(proprietario.getCodiceFiscale());
        dto.setStato(proprietario.getStato());
        
        // Set animali information
        if (proprietario.getAnimali() != null) {
            List<Long> animaliIds = proprietario.getAnimali().stream()
                .map(animale -> animale.getId())
                .collect(java.util.stream.Collectors.toList());
            dto.setAnimaliIds(animaliIds);
        } else {
            dto.setAnimaliIds(java.util.Collections.emptyList());
        }

        return dto;
    }
}