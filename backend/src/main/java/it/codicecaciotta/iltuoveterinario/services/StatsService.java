package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;

public interface StatsService {

    /**
     * Get vaccination statistics
     * @return VaccinazioneStatsDTO with counts by status
     */
    VaccinazioneStatsDTO getVaccinazioneStats();

    /**
     * Get animal statistics
     * @return AnimaleStatsDTO with counts by specie and status
     */
    AnimaleStatsDTO getAnimaleStats();

    /**
     * Get owner statistics
     * @return ProprietarioStatsDTO with active/inactive counts and averages
     */
    ProprietarioStatsDTO getProprietarioStats();

    /**
     * Get fatture statistics
     * @return FatturaStatsDTO with counts and amounts by payment status and monthly breakdown
     */
    FatturaStatsDTO getFatturaStats();
}
