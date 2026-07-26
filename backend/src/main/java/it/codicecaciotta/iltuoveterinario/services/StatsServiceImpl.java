package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.DashboardStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO.FatturaMensileDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrestazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VisitaOggiDTO;
import it.codicecaciotta.iltuoveterinario.models.Prenotazione;
import it.codicecaciotta.iltuoveterinario.models.Prestazione;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.FatturaRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrenotazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.PrestazioneRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatsServiceImpl implements StatsService {

    private final VaccinazioneRepository vaccinazioneRepository;
    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;
    private final FatturaRepository fatturaRepository;
    private final PrenotazioneRepository prenotazioneRepository;
    private final PrestazioneRepository prestazioneRepository;

    public StatsServiceImpl(VaccinazioneRepository vaccinazioneRepository,
                          AnimaleRepository animaleRepository,
                          ProprietarioRepository proprietarioRepository,
                          FatturaRepository fatturaRepository,
                          PrenotazioneRepository prenotazioneRepository,
                          PrestazioneRepository prestazioneRepository) {
        this.vaccinazioneRepository = vaccinazioneRepository;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
        this.fatturaRepository = fatturaRepository;
        this.prenotazioneRepository = prenotazioneRepository;
        this.prestazioneRepository = prestazioneRepository;
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

    @Override
    public PrestazioneStatsDTO getPrestazioneStats() {
        long totalCount = prestazioneRepository.count();
        long activeCount = prestazioneRepository.countByStato("Disponibile");
        long inactiveCount = prestazioneRepository.countByStato("Non disponibile");

        BigDecimal avgCost = prestazioneRepository.averageCostoBase();
        String averageCost = avgCost != null ? avgCost.setScale(2, BigDecimal.ROUND_HALF_UP).toPlainString() : "0.00";

        Double avgDuration = prestazioneRepository.averageDurataStimata();
        long averageDuration = avgDuration != null ? Math.round(avgDuration) : 0;

        return new PrestazioneStatsDTO(totalCount, activeCount, inactiveCount, averageCost, averageDuration);
    }

    @Override
    public DashboardStatsDTO getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        long visiteOggi = prenotazioneRepository.countByDataOraAppuntamentoBetween(startOfDay, endOfDay);
        long prenotazioniTotali = prenotazioneRepository.count();
        long fattureNonPagate = fatturaRepository.countByPagata(false);
        BigDecimal importoNonPagato = fatturaRepository.sumImportoTotaleByPagata(false);
        if (importoNonPagato == null) importoNonPagato = BigDecimal.ZERO;
        long animaliTotali = animaleRepository.count();
        long proprietariTotali = proprietarioRepository.count();
        long proprietariAttivi = proprietarioRepository.countAttivi();

        List<Prenotazione> visiteOggiList = prenotazioneRepository
                .findByDataOraAppuntamentoBetweenOrderByDataOraAppuntamentoAsc(startOfDay, endOfDay);

        List<VisitaOggiDTO> visiteOggiDTOs = visiteOggiList.stream()
                .map(p -> new VisitaOggiDTO(
                        p.getAnimale() != null ? p.getAnimale().getNome() : "Sconosciuto",
                        p.getProprietario() != null ? p.getProprietario().getNome() : "",
                        p.getProprietario() != null ? p.getProprietario().getCognome() : "",
                        p.getDataOraAppuntamento(),
                        p.getTipoVisita()
                ))
                .collect(Collectors.toList());

        return new DashboardStatsDTO(
                visiteOggi, prenotazioniTotali, fattureNonPagate,
                importoNonPagato, animaliTotali, proprietariTotali, proprietariAttivi,
                visiteOggiDTOs
        );
    }
}
