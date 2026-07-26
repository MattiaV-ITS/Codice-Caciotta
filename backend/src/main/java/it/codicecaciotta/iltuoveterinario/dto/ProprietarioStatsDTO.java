package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProprietarioStatsDTO extends StatsDTO {
    private long attiviCount;
    private long inattiviCount;
    private double averageAnimaliPerProprietario;

    public ProprietarioStatsDTO(long totalCount, long attiviCount, long inattiviCount, double averageAnimaliPerProprietario) {
        super("proprietari", totalCount);
        this.attiviCount = attiviCount;
        this.inattiviCount = inattiviCount;
        this.averageAnimaliPerProprietario = averageAnimaliPerProprietario;
    }
}