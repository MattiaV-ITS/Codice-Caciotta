package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO.FatturaMensileDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.FatturaRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatsServiceImpl implements StatsService {

    private final VaccinazioneRepository vaccinazioneRepository;
    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;
    private final FatturaRepository fatturaRepository;

    public StatsServiceImpl(VaccinazioneRepository vaccinazioneRepository,
                          AnimaleRepository animaleRepository,
                          ProprietarioRepository proprietarioRepository,
                          FatturaRepository fatturaRepository) {
        this.vaccinazioneRepository = vaccinazioneRepository;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
        this.fatturaRepository = fatturaRepository;
    }

    @Override
    public VaccinazioneStatsDTO getVaccinazioneStats() {
        long totalCount = vaccinazioneRepository.count();
        long valideCount = vaccinazioneRepository.countValide();
        long prossimeCount = vaccinazioneRepository.countProssime();
        long scaduteCount = vaccinazioneRepository.countScadute();

        return new VaccinazioneStatsDTO(totalCount, valideCount, prossimeCount, scaduteCount);
    }

    @Override
    public AnimaleStatsDTO getAnimaleStats() {
        long totalCount = animaleRepository.count();
        long caneCount = animaleRepository.countBySpecieCane();
        long gattoCount = animaleRepository.countBySpecieGatto();
        long altroCount = animaleRepository.countBySpecieAltro();
        long sanoCount = animaleRepository.countByStatoSano();
        long malatoCount = animaleRepository.countByStatoMalato();
        long inCuraCount = animaleRepository.countByStatoInCura();
        long decedutoCount = animaleRepository.countByStatoDeceduto();

        return new AnimaleStatsDTO(totalCount, caneCount, gattoCount, altroCount,
                                  sanoCount, malatoCount, inCuraCount, decedutoCount);
    }

    @Override
    public ProprietarioStatsDTO getProprietarioStats() {
        long totalCount = proprietarioRepository.count();
        long attiviCount = proprietarioRepository.countAttivi();
        long inattiviCount = proprietarioRepository.countInattivi();

        // Calculate average animals per owner
        double averageAnimaliPerProprietario = 0.0;
        if (totalCount > 0) {
            long totalAnimali = animaleRepository.count();
            averageAnimaliPerProprietario = (double) totalAnimali / totalCount;
        }

        return new ProprietarioStatsDTO(totalCount, attiviCount, inattiviCount, averageAnimaliPerProprietario);
    }

    @Override
    public FatturaStatsDTO getFatturaStats() {
        long totaleFatture = fatturaRepository.count();
        long fatturePagate = fatturaRepository.countByPagata(true);
        long fattureNonPagate = fatturaRepository.countByPagata(false);
        BigDecimal importoTotale = fatturaRepository.sumImportoTotale();
        BigDecimal importoPagato = fatturaRepository.sumImportoTotaleByPagata(true);
        BigDecimal importoNonPagato = fatturaRepository.sumImportoTotaleByPagata(false);

        // Monthly breakdown
        List<Object[]> mensili = fatturaRepository.getFattureMensili();
        List<FatturaMensileDTO> fatturePerMese = new ArrayList<>();
        for (Object[] row : mensili) {
            int anno = ((Number) row[0]).intValue();
            int mese = ((Number) row[1]).intValue();
            long totale = ((Number) row[2]).longValue();
            long pagate = ((Number) row[3]).longValue();
            long nonPagate = ((Number) row[4]).longValue();
            BigDecimal importoMensile = (BigDecimal) row[5];
            fatturePerMese.add(new FatturaMensileDTO(anno, mese, totale, pagate, nonPagate, importoMensile));
        }

        return new FatturaStatsDTO(totaleFatture, fatturePagate, fattureNonPagate,
                                  importoTotale, importoPagato, importoNonPagato,
                                  fatturePerMese);
    }
}