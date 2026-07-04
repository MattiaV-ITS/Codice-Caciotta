package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaDTO;
import it.codicecaciotta.iltuoveterinario.models.Visita;

import org.springframework.lang.NonNull;

import java.util.List;

public interface VisitaService {
    List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId);
    Visita getVisitaById(@NonNull Long visitaId);
    Visita createVisita(Visita visita);
    Visita updateVisita(@NonNull Long id, Visita visita);
    void deleteVisita(@NonNull Long id);
    VisitaSchedaDTO getVisitaSchedaById(@NonNull Long id);
}