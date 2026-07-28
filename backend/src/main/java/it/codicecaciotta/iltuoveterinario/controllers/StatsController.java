package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.DashboardStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.FatturaStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.PrestazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioStatsDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneStatsDTO;
import it.codicecaciotta.iltuoveterinario.services.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/vaccinazioni")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<VaccinazioneStatsDTO> getVaccinazioneStats() {
        return ResponseEntity.ok(statsService.getVaccinazioneStats());
    }

    @GetMapping("/animali")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AnimaleStatsDTO> getAnimaleStats() {
        return ResponseEntity.ok(statsService.getAnimaleStats());
    }

    @GetMapping("/proprietari")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProprietarioStatsDTO> getProprietarioStats() {
        return ResponseEntity.ok(statsService.getProprietarioStats());
    }

    @GetMapping("/fatture")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<FatturaStatsDTO> getFatturaStats() {
        return ResponseEntity.ok(statsService.getFatturaStats());
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(statsService.getDashboardStats());
    }

    @GetMapping("/animali-vaccinazioni-scadute")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Long>> getAnimaliVaccinazioniScadute() {
        return ResponseEntity.ok(statsService.getAnimaliVaccinazioniScadute());
    }

    @GetMapping("/animali-vaccinazioni-scadute/proprietario/{proprietarioId}")
    public ResponseEntity<List<Long>> getAnimaliVaccinazioniScaduteByProprietario(@PathVariable Long proprietarioId) {
        return ResponseEntity.ok(statsService.getAnimaliVaccinazioniScaduteByProprietario(proprietarioId));
    }

    @GetMapping("/prestazioni")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PrestazioneStatsDTO> getPrestazioneStats() {
        return ResponseEntity.ok(statsService.getPrestazioneStats());
    }
}
