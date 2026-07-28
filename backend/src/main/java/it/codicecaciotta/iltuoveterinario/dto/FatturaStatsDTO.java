package it.codicecaciotta.iltuoveterinario.dto;

import java.math.BigDecimal;
import java.util.List;

public class FatturaStatsDTO {
    private long totaleFatture;
    private long fatturePagate;
    private long fattureNonPagate;
    private BigDecimal importoTotale;
    private BigDecimal importoPagato;
    private BigDecimal importoNonPagato;
    private List<FatturaMensileDTO> fatturePerMese;

    public FatturaStatsDTO() {}

    public FatturaStatsDTO(long totaleFatture, long fatturePagate, long fattureNonPagate,
                          BigDecimal importoTotale, BigDecimal importoPagato, BigDecimal importoNonPagato,
                          List<FatturaMensileDTO> fatturePerMese) {
        this.totaleFatture = totaleFatture;
        this.fatturePagate = fatturePagate;
        this.fattureNonPagate = fattureNonPagate;
        this.importoTotale = importoTotale;
        this.importoPagato = importoPagato;
        this.importoNonPagato = importoNonPagato;
        this.fatturePerMese = fatturePerMese;
    }

    public long getTotaleFatture() { return totaleFatture; }
    public long getFatturePagate() { return fatturePagate; }
    public long getFattureNonPagate() { return fattureNonPagate; }
    public BigDecimal getImportoTotale() { return importoTotale; }
    public BigDecimal getImportoPagato() { return importoPagato; }
    public BigDecimal getImportoNonPagato() { return importoNonPagato; }
    public List<FatturaMensileDTO> getFatturePerMese() { return fatturePerMese; }

    public void setTotaleFatture(long totaleFatture) { this.totaleFatture = totaleFatture; }
    public void setFatturePagate(long fatturePagate) { this.fatturePagate = fatturePagate; }
    public void setFattureNonPagate(long fattureNonPagate) { this.fattureNonPagate = fattureNonPagate; }
    public void setImportoTotale(BigDecimal importoTotale) { this.importoTotale = importoTotale; }
    public void setImportoPagato(BigDecimal importoPagato) { this.importoPagato = importoPagato; }
    public void setImportoNonPagato(BigDecimal importoNonPagato) { this.importoNonPagato = importoNonPagato; }
    public void setFatturePerMese(List<FatturaMensileDTO> fatturePerMese) { this.fatturePerMese = fatturePerMese; }

    public static class FatturaMensileDTO {
        private int anno;
        private int mese;
        private long totale;
        private long pagate;
        private long nonPagate;
        private BigDecimal importoTotale;

        public FatturaMensileDTO() {}

        public FatturaMensileDTO(int anno, int mese, long totale, long pagate, long nonPagate, BigDecimal importoTotale) {
            this.anno = anno;
            this.mese = mese;
            this.totale = totale;
            this.pagate = pagate;
            this.nonPagate = nonPagate;
            this.importoTotale = importoTotale;
        }

        public int getAnno() { return anno; }
        public int getMese() { return mese; }
        public long getTotale() { return totale; }
        public long getPagate() { return pagate; }
        public long getNonPagate() { return nonPagate; }
        public BigDecimal getImportoTotale() { return importoTotale; }

        public void setAnno(int anno) { this.anno = anno; }
        public void setMese(int mese) { this.mese = mese; }
        public void setTotale(long totale) { this.totale = totale; }
        public void setPagate(long pagate) { this.pagate = pagate; }
        public void setNonPagate(long nonPagate) { this.nonPagate = nonPagate; }
        public void setImportoTotale(BigDecimal importoTotale) { this.importoTotale = importoTotale; }
    }
}