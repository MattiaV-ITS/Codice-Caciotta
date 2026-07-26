package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class AnimaleStatsDTO extends StatsDTO {
    private long caneCount;
    private long gattoCount;
    private long altroCount;
    private long sanoCount;
    private long malatoCount;
    private long inCuraCount;
    private long decedutoCount;

    public AnimaleStatsDTO(long totalCount, long caneCount, long gattoCount, long altroCount,
                          long sanoCount, long malatoCount, long inCuraCount, long decedutoCount) {
        super("animali", totalCount);
        this.caneCount = caneCount;
        this.gattoCount = gattoCount;
        this.altroCount = altroCount;
        this.sanoCount = sanoCount;
        this.malatoCount = malatoCount;
        this.inCuraCount = inCuraCount;
        this.decedutoCount = decedutoCount;
    }
}