package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;

@Data
public class StatsDTO {
    private long totalCount;
    private String entityType;

    // Common stats that can be extended by specific entity stats
    public StatsDTO(String entityType, long totalCount) {
        this.entityType = entityType;
        this.totalCount = totalCount;
    }
}