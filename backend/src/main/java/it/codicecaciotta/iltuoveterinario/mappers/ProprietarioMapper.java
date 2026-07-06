package it.codicecaciotta.iltuoveterinario.mappers;

import java.util.ArrayList;
import java.util.stream.Collectors;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;

public class ProprietarioMapper {

    public static ProprietarioDTO toDTO(Proprietario proprietario) {
        if (proprietario == null) {
            return null;
        }

        ProprietarioDTO dto = new ProprietarioDTO();
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

        if (proprietario.getAnimali() != null) {
            dto.setAnimaliIds(
                proprietario.getAnimali().stream()
                    .map(animale -> animale.getId())
                    .collect(Collectors.toList())
            );
        } else {
            dto.setAnimaliIds(new ArrayList<>());
        }

        return dto;
    }
}
