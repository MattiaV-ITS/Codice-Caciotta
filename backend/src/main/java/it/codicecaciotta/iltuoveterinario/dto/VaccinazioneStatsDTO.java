package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class VaccinazioneStatsDTO extends StatsDTO {
    private long valideCount;
    private long prossimeCount;
    private long scaduteCount;

    public VaccinazioneStatsDTO(long totalCount, long valideCount, long prossimeCount, long scaduteCount) {
        super("vaccinazioni", totalCount);
        this.valideCount = valideCount;
        this.prossimeCount = prossimeCount;
        this.scaduteCount = scaduteCount;
    }
}