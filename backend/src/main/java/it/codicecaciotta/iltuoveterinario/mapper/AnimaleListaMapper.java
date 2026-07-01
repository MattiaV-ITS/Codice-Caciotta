package it.codicecaciotta.iltuoveterinario.mapper;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;

public class AnimaleListaMapper {

    public static AnimaleListaDTO toListaDTO(Animale animale) {
        if (animale == null) return null;

        AnimaleListaDTO dto = new AnimaleListaDTO();
        dto.setId(animale.getId());
        dto.setNome(animale.getNome());
        dto.setSpecie(animale.getSpecie());
        dto.setRazza(animale.getRazza());
        dto.setSesso(animale.getSesso());
        dto.setDataNascita(animale.getDataNascita());
        dto.setMicrochip(animale.getMicrochip());
        dto.setStato(animale.getStato());
        
        if (animale.getProprietario() != null) {
            dto.setIdProprietario(animale.getProprietario().getId());
            dto.setProprietario(animale.getProprietario().getNome() + " " + animale.getProprietario().getCognome());
        }

        return dto;
    }
}