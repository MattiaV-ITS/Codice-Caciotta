package it.codicecaciotta.iltuoveterinario.mapper;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioListaDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;

public class ProprietarioListaMapper {

    public static ProprietarioListaDTO toListaDTO(Proprietario proprietario) {
        if (proprietario == null) return null;

        ProprietarioListaDTO dto = new ProprietarioListaDTO();
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
        
        // Count the number of animals
        if (proprietario.getAnimali() != null) {
            dto.setNumeroAnimali(proprietario.getAnimali().size());
        } else {
            dto.setNumeroAnimali(0);
        }

        return dto;
    }
}