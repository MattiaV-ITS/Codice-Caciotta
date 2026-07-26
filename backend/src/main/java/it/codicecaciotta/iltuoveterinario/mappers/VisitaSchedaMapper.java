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
        // Deriva il tipoVisita: prima dal campo diretto, poi dalla prenotazione, poi dalle prestazioni collegate
        String tipoVisita = visita.getTipoVisita();
        if (tipoVisita == null && visita.getPrenotazione() != null) {
            tipoVisita = visita.getPrenotazione().getTipoVisita();
        }
        if (tipoVisita == null && visita.getPrestazioni() != null && !visita.getPrestazioni().isEmpty()) {
            tipoVisita = visita.getPrestazioni().stream()
                .map(p -> p.getNomePrestazione())
                .collect(java.util.stream.Collectors.joining(", "));
        }
        dto.setTipoVisita(tipoVisita);
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