package it.codicecaciotta.iltuoveterinario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class PrestazioneStatsDTO extends StatsDTO {
    private long activeCount;
    private long inactiveCount;
    private String averageCost;
    private long averageDuration;

    public PrestazioneStatsDTO(long totalCount, long activeCount, long inactiveCount, String averageCost, long averageDuration) {
        super("prestazioni", totalCount);
        this.activeCount = activeCount;
        this.inactiveCount = inactiveCount;
        this.averageCost = averageCost;
        this.averageDuration = averageDuration;
    }
}