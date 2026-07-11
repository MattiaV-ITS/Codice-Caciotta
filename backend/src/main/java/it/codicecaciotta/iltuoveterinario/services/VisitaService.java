package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaSchedaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import jakarta.validation.Valid;

import org.springframework.lang.NonNull;

import java.util.List;

public interface VisitaService {
    Visita createVisitaScheda(@NonNull Long animaleId, @Valid VisitaSchedaCreateDTO dto);
    Visita updateVisitaScheda(Long id, VisitaSchedaUpdateDTO dto);
    void deleteVisita(@NonNull Long id);
    Visita getVisitaById(@NonNull Long visitaId);
    List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId);
}