package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.VisitaCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Visita;
import jakarta.validation.Valid;

import org.springframework.lang.NonNull;

import java.util.List;

public interface VisitaService {
    Visita createVisita(@NonNull Long animaleId, @Valid VisitaCreateDTO dto);
    Visita updateVisita(@NonNull Long id, VisitaUpdateDTO dto);
    void deleteVisita(@NonNull Long id);
    Visita getVisitaById(@NonNull Long visitaId);
    List<Visita> getVisiteByAnimaleId(@NonNull Long animaleId);
}