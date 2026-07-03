package it.codicecaciotta.iltuoveterinario.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

// DTO per la visualizzazione della scheda della visita e Diario Clinico
@Data
public class VisitaSchedaDTO {
    public Long id;
    public String dataOraVisita; // per visualizzazione nella scheda, formato dd/MM/yyyy HH:mm
    public Integer durata; // in minuti, puo essere null se non effettuata
    public String tipoVisita; // per visualizzazione nella scheda, es. "Visita di controllo", "Vaccinazione", ecc.
    public String sintomi;
    public String diagnosi;
    public String trattamentoTerapia;
    public String note;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public String notePrivate; // Note private visibili solo al veterinario
}
