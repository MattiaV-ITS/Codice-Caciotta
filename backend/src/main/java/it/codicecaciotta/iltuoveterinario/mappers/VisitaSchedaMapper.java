package it.codicecaciotta.iltuoveterinario.mappers;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;
import it.codicecaciotta.iltuoveterinario.models.Visita;

public class VisitaSchedaMapper {
    public static VisitaSchedaDTO toSchedaDTO(Visita visita) {
        if (visita == null)
            return null;

        VisitaSchedaDTO dto = new VisitaSchedaDTO();
        dto.setId(visita.getId());
        dto.setAnimaleId(visita.getAnimale() != null ? visita.getAnimale().getId() : null);
        dto.setDataOraVisita(visita.getDataOraVisita() != null
                ? visita.getDataOraVisita().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : null);
        dto.setDataOraFineVisita(visita.getDataOraFineVisita() != null
                ? visita.getDataOraFineVisita().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : null);
        dto.setDurata(visita.getDurata());
        dto.setTipoVisita(visita.getTipoVisita() != null ? visita.getTipoVisita() : (visita.getPrenotazione() != null ? visita.getPrenotazione().getTipoVisita() : null));
        DiarioClinico diario = visita.getDiarioClinico();
        if (diario != null) {
            dto.setSintomi(diario.getSintomi());
            dto.setDiagnosi(diario.getDiagnosi());
            dto.setTrattamentoTerapia(diario.getTrattamentoTerapia());
            dto.setNote(diario.getNote());
            dto.setNotePrivate(diario.getNotePrivate());
        }

        return dto;
    }
}