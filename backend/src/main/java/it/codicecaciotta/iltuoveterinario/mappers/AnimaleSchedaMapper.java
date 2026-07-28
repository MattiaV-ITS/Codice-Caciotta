package it.codicecaciotta.iltuoveterinario.mappers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleSchedaDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;

public class AnimaleSchedaMapper {
    
    public static AnimaleSchedaDTO toSchedaDTO(Animale animale) {
        return toSchedaDTO(animale, true);
    }

    public static AnimaleSchedaDTO toSchedaDTO(Animale animale, boolean includePrivateNotes) {
        if (animale == null) return null;

        AnimaleSchedaDTO dto = new AnimaleSchedaDTO();
        dto.setId(animale.getId());
        dto.setStato(animale.getStato().name());
        dto.setNome(animale.getNome());
        dto.setSpecie(animale.getSpecie());
        dto.setRazza(animale.getRazza());
        dto.setDataNascita(animale.getDataNascita());
        dto.setEta(
            animale.getDataNascita() != null ?
            String.format("%d anni, %d mesi",
                java.time.Period.between(animale.getDataNascita(), java.time.LocalDate.now()).getYears(),
                java.time.Period.between(animale.getDataNascita(), java.time.LocalDate.now()).getMonths()
            ) : null
        );
        dto.setSesso(animale.getSesso());
        dto.setPeso(animale.getPeso());
        dto.setMicrochip(animale.getMicrochip());
        dto.setTaglia(animale.getTaglia());
        dto.setColoreMantello(animale.getColoreMantello());
        dto.setSterilizzato(animale.getSterilizzato());
        dto.setGruppoSanguigno(animale.getGruppoSanguigno());
        dto.setAllergie(animale.getAllergie());
        dto.setPatologie(animale.getPatologie());
        dto.setNoteGenerali(animale.getNoteGenerali());

        // Note private visibili solo a staff/admin
        if (includePrivateNotes) {
            dto.setNotePrivate(animale.getNotePrivate());
        }

        if (animale.getProprietario() != null) {
            dto.setIdProprietario(animale.getProprietario().getId().toString());
            dto.setProprietario(animale.getProprietario().getNome() + " " + animale.getProprietario().getCognome());
            dto.setTelefonoProprietario(animale.getProprietario().getTelefono());
        }

        return dto;
    }
}