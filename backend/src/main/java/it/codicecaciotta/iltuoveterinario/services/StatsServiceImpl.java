package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import it.codicecaciotta.iltuoveterinario.repositories.VaccinazioneRepository;
import org.springframework.stereotype.Service;

@Service
public class StatsServiceImpl implements StatsService {

    private final VaccinazioneRepository vaccinazioneRepository;
    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;

    public StatsServiceImpl(VaccinazioneRepository vaccinazioneRepository,
                          AnimaleRepository animaleRepository,
                          ProprietarioRepository proprietarioRepository) {
        this.vaccinazioneRepository = vaccinazioneRepository;
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
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
}