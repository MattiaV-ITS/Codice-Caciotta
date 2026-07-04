package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.models.DiarioClinico;

import org.springframework.lang.NonNull;

public interface DiarioClinicoService {
    DiarioClinico getDiarioClinicoById(@NonNull Long id);
    DiarioClinico getDiarioClinicoByVisitaId(@NonNull Long visitaId);
    DiarioClinico createDiarioClinico(DiarioClinico diarioClinico);
    DiarioClinico updateDiarioClinico(@NonNull Long id, DiarioClinico diarioClinico);
    void deleteDiarioClinico(@NonNull Long id);
}