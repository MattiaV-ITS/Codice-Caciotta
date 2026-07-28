package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.DashboardStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrestazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;

import java.util.List;

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

    /**
     * Get aggregated dashboard statistics
     * @return DashboardStatsDTO with today's visits, totals, and unpaid invoices
     */
    DashboardStatsDTO getDashboardStats();

    /**
     * Get prestazioni statistics
     * @return PrestazioneStatsDTO with counts and averages
     */
    PrestazioneStatsDTO getPrestazioneStats();

    /**
     * Get count of animals with expired vaccinations (most recent vaccination per type is expired)
     * @return count of animals with at least one expired vaccination type
     */
    long getAnimaliVaccinazioniScaduteCount();

    /**
     * Get list of animal IDs with expired vaccinations (most recent vaccination per type is expired)
     * @return list of animal IDs with at least one expired vaccination type
     */
    List<Long> getAnimaliVaccinazioniScadute();

    /**
     * Get list of animal IDs with expired vaccinations for a specific owner
     * @param proprietarioId owner ID
     * @return list of animal IDs with at least one expired vaccination type
     */
    List<Long> getAnimaliVaccinazioniScaduteByProprietario(Long proprietarioId);
}
