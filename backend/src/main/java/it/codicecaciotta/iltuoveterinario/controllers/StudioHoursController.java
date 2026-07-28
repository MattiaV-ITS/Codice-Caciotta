package it.codicecaciotta.iltuoveterinario.controllers;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import it.codicecaciotta.iltuoveterinario.models.EGiornoSettimana;
import it.codicecaciotta.iltuoveterinario.models.OrarioStudio;
import it.codicecaciotta.iltuoveterinario.payload.response.MessageResponse;
import it.codicecaciotta.iltuoveterinario.services.OrarioStudioService;

@RestController
@RequestMapping("/api/admin/orari")
public class StudioHoursController {

	private static final Logger logger = LoggerFactory.getLogger(StudioHoursController.class);

	private final OrarioStudioService orarioStudioService;

	public StudioHoursController(OrarioStudioService orarioStudioService) {
		this.orarioStudioService = orarioStudioService;
	}

	@PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("")
	public ResponseEntity<StudioHoursResponse> getAllStudioHours() {
		List<OrarioStudio> defaultOrari = orarioStudioService.getAllDefaultOrari();
		List<OrarioStudio> specificOrari = orarioStudioService.getAllSpecificOrari();

		StudioHoursResponse response = new StudioHoursResponse();
		response.setDefaultOrari(defaultOrari);
		response.setSpecificOrari(specificOrari);

		return ResponseEntity.ok(response);
	}

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/default")
    public ResponseEntity<?> updateDefaultHours(@Valid @RequestBody UpdateDefaultHoursRequest request) {
        try {
            OrarioStudio updated = orarioStudioService.updateDefaultOrario(
                    request.getGiornoSettimana(),
                    request.getOraApertura(),
                    request.getOraChiusura(),
                    request.isChiuso()
            );

            logger.info("Updated default hours for {}: {}-{} ({})",
                    updated.getGiornoSettimana(),
                    updated.getOraApertura(),
                    updated.getOraChiusura(),
                    updated.getChiuso() ? "closed" : "open");

            return ResponseEntity.ok(new MessageResponse("Orari predefiniti aggiornati con successo"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/default/all")
    public ResponseEntity<?> updateAllDefaultHours(@Valid @RequestBody UpdateAllDefaultHoursRequest request) {
        try {
            orarioStudioService.updateAllDefaultOrari(
                    request.getOraApertura(),
                    request.getOraChiusura(),
                    request.getOraInizioPausaPranzo(),
                    request.getOraFinePausaPranzo(),
                    request.isChiuso(),
                    request.getGiorniEsclusi()
            );

            logger.info("Updated all default hours: {}-{} (lunch: {}-{}) excluding {} days",
                    request.getOraApertura(), request.getOraChiusura(),
                    request.getOraInizioPausaPranzo(), request.getOraFinePausaPranzo(),
                    request.getGiorniEsclusi());

            return ResponseEntity.ok(new MessageResponse("Tutti gli orari predefiniti aggiornati con successo"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/default/with-lunch")
    public ResponseEntity<?> updateDefaultHoursWithLunchBreak(@Valid @RequestBody UpdateDefaultHoursWithLunchRequest request) {
        try {
            OrarioStudio updated = orarioStudioService.updateDefaultOrarioWithLunchBreak(
                    request.getGiornoSettimana(),
                    request.getOraApertura(),
                    request.getOraChiusura(),
                    request.getOraInizioPausaPranzo(),
                    request.getOraFinePausaPranzo(),
                    request.isChiuso()
            );

            logger.info("Updated default hours with lunch break for {}: {}-{} (lunch: {}-{}) ({})",
                    updated.getGiornoSettimana(),
                    updated.getOraApertura(),
                    updated.getOraChiusura(),
                    updated.getOraInizioPausaPranzo(),
                    updated.getOraFinePausaPranzo(),
                    updated.getChiuso() ? "closed" : "open");

            return ResponseEntity.ok(new MessageResponse("Orari predefiniti con pausa pranzo aggiornati con successo"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping("/specific")
	public ResponseEntity<?> addSpecificDateOverride(@Valid @RequestBody AddSpecificDateRequest request) {
		try {
			OrarioStudio created = orarioStudioService.addOrUpdateSpecificOrario(
					request.getData(),
					request.getOraApertura(),
					request.getOraChiusura(),
					request.isChiuso()
			);

			logger.info("Added/updated specific date override for {}: {}-{} ({})",
					created.getDataSpecifica(),
					created.getOraApertura(),
					created.getOraChiusura(),
					created.getChiuso() ? "closed" : "open");

			return ResponseEntity.ok(new MessageResponse("Eccezione data specifica aggiunta/aggiornata con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping("/specific/with-lunch")
	public ResponseEntity<?> addSpecificDateOverrideWithLunchBreak(@Valid @RequestBody AddSpecificDateWithLunchRequest request) {
		try {
			OrarioStudio created = orarioStudioService.addOrUpdateSpecificOrarioWithLunchBreak(
					request.getData(),
					request.getOraApertura(),
					request.getOraChiusura(),
					request.getOraInizioPausaPranzo(),
					request.getOraFinePausaPranzo(),
					request.isChiuso()
			);

			logger.info("Added/updated specific date override with lunch break for {}: {}-{} (lunch: {}-{}) ({})",
					created.getDataSpecifica(),
					created.getOraApertura(),
					created.getOraChiusura(),
					created.getOraInizioPausaPranzo(),
					created.getOraFinePausaPranzo(),
					created.getChiuso() ? "closed" : "open");

			return ResponseEntity.ok(new MessageResponse("Eccezione data specifica con pausa pranzo aggiunta/aggiornata con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/specific/{id}/with-lunch")
	public ResponseEntity<?> updateSpecificDateOverrideWithLunchBreak(@PathVariable Long id, @Valid @RequestBody AddSpecificDateWithLunchRequest request) {
		try {
			OrarioStudio updated = orarioStudioService.addOrUpdateSpecificOrarioWithLunchBreak(
					request.getData(),
					request.getOraApertura(),
					request.getOraChiusura(),
					request.getOraInizioPausaPranzo(),
					request.getOraFinePausaPranzo(),
					request.isChiuso()
			);

			logger.info("Updated specific date override with lunch break for {}: {}-{} (lunch: {}-{}) ({})",
					updated.getDataSpecifica(),
					updated.getOraApertura(),
					updated.getOraChiusura(),
					updated.getOraInizioPausaPranzo(),
					updated.getOraFinePausaPranzo(),
					updated.getChiuso() ? "closed" : "open");

			return ResponseEntity.ok(new MessageResponse("Eccezione data specifica con pausa pranzo aggiornata con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@DeleteMapping("/specific/{id}")
	public ResponseEntity<?> removeSpecificDateOverride(@PathVariable Long id) {
		try {
			orarioStudioService.removeSpecificOrario(id);
			logger.info("Removed specific date override with ID: {}", id);

			return ResponseEntity.ok(new MessageResponse("Eccezione data specifica rimossa con successo"));
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(new MessageResponse("Impossibile rimuovere l'eccezione data specifica"));
		}
	}

	// =======================================
	// REQUEST/RESPONSE CLASSES
	// =======================================

	public static class StudioHoursResponse {
		private List<OrarioStudio> defaultOrari;
		private List<OrarioStudio> specificOrari;

		// Getters and setters
		public List<OrarioStudio> getDefaultOrari() {
			return defaultOrari;
		}

		public void setDefaultOrari(List<OrarioStudio> defaultOrari) {
			this.defaultOrari = defaultOrari;
		}

		public List<OrarioStudio> getSpecificOrari() {
			return specificOrari;
		}

		public void setSpecificOrari(List<OrarioStudio> specificOrari) {
			this.specificOrari = specificOrari;
		}
	}

	public static class UpdateAllDefaultHoursRequest {
		private LocalTime oraApertura;
		private LocalTime oraChiusura;
		private LocalTime oraInizioPausaPranzo;
		private LocalTime oraFinePausaPranzo;
		private boolean chiuso;
		private Set<EGiornoSettimana> giorniEsclusi;

		// Getters and setters
		public LocalTime getOraApertura() {
			return oraApertura;
		}

		public void setOraApertura(LocalTime oraApertura) {
			this.oraApertura = oraApertura;
		}

		public LocalTime getOraChiusura() {
			return oraChiusura;
		}

		public void setOraChiusura(LocalTime oraChiusura) {
			this.oraChiusura = oraChiusura;
		}

		public LocalTime getOraInizioPausaPranzo() {
			return oraInizioPausaPranzo;
		}

		public void setOraInizioPausaPranzo(LocalTime oraInizioPausaPranzo) {
			this.oraInizioPausaPranzo = oraInizioPausaPranzo;
		}

		public LocalTime getOraFinePausaPranzo() {
			return oraFinePausaPranzo;
		}

		public void setOraFinePausaPranzo(LocalTime oraFinePausaPranzo) {
			this.oraFinePausaPranzo = oraFinePausaPranzo;
		}

		public boolean isChiuso() {
			return chiuso;
		}

		public void setChiuso(boolean chiuso) {
			this.chiuso = chiuso;
		}

		public Set<EGiornoSettimana> getGiorniEsclusi() {
			return giorniEsclusi;
		}

		public void setGiorniEsclusi(Set<EGiornoSettimana> giorniEsclusi) {
			this.giorniEsclusi = giorniEsclusi;
		}
	}

	public static class UpdateDefaultHoursRequest {
		private EGiornoSettimana giornoSettimana;
		private LocalTime oraApertura;
		private LocalTime oraChiusura;
		private boolean chiuso;

		// Getters and setters
		public EGiornoSettimana getGiornoSettimana() {
			return giornoSettimana;
		}

		public void setGiornoSettimana(EGiornoSettimana giornoSettimana) {
			this.giornoSettimana = giornoSettimana;
		}

		public LocalTime getOraApertura() {
			return oraApertura;
		}

		public void setOraApertura(LocalTime oraApertura) {
			this.oraApertura = oraApertura;
		}

		public LocalTime getOraChiusura() {
			return oraChiusura;
		}

		public void setOraChiusura(LocalTime oraChiusura) {
			this.oraChiusura = oraChiusura;
		}

		public boolean isChiuso() {
			return chiuso;
		}

		public void setChiuso(boolean chiuso) {
			this.chiuso = chiuso;
		}
	}

	public static class UpdateDefaultHoursWithLunchRequest {
		private EGiornoSettimana giornoSettimana;
		private LocalTime oraApertura;
		private LocalTime oraChiusura;
		private LocalTime oraInizioPausaPranzo;
		private LocalTime oraFinePausaPranzo;
		private boolean chiuso;

		// Getters and setters
		public EGiornoSettimana getGiornoSettimana() {
			return giornoSettimana;
		}

		public void setGiornoSettimana(EGiornoSettimana giornoSettimana) {
			this.giornoSettimana = giornoSettimana;
		}

		public LocalTime getOraApertura() {
			return oraApertura;
		}

		public void setOraApertura(LocalTime oraApertura) {
			this.oraApertura = oraApertura;
		}

		public LocalTime getOraChiusura() {
			return oraChiusura;
		}

		public void setOraChiusura(LocalTime oraChiusura) {
			this.oraChiusura = oraChiusura;
		}

		public LocalTime getOraInizioPausaPranzo() {
			return oraInizioPausaPranzo;
		}

		public void setOraInizioPausaPranzo(LocalTime oraInizioPausaPranzo) {
			this.oraInizioPausaPranzo = oraInizioPausaPranzo;
		}

		public LocalTime getOraFinePausaPranzo() {
			return oraFinePausaPranzo;
		}

		public void setOraFinePausaPranzo(LocalTime oraFinePausaPranzo) {
			this.oraFinePausaPranzo = oraFinePausaPranzo;
		}

		public boolean isChiuso() {
			return chiuso;
		}

		public void setChiuso(boolean chiuso) {
			this.chiuso = chiuso;
		}
	}

	public static class AddSpecificDateRequest {
		private LocalDate data;
		private LocalTime oraApertura;
		private LocalTime oraChiusura;
		private boolean chiuso;

		// Getters and setters
		public LocalDate getData() {
			return data;
		}

		public void setData(LocalDate data) {
			this.data = data;
		}

		public LocalTime getOraApertura() {
			return oraApertura;
		}

		public void setOraApertura(LocalTime oraApertura) {
			this.oraApertura = oraApertura;
		}

		public LocalTime getOraChiusura() {
			return oraChiusura;
		}

		public void setOraChiusura(LocalTime oraChiusura) {
			this.oraChiusura = oraChiusura;
		}

		public boolean isChiuso() {
			return chiuso;
		}

		public void setChiuso(boolean chiuso) {
			this.chiuso = chiuso;
		}
	}

	public static class AddSpecificDateWithLunchRequest {
		private LocalDate data;
		private LocalTime oraApertura;
		private LocalTime oraChiusura;
		private LocalTime oraInizioPausaPranzo;
		private LocalTime oraFinePausaPranzo;
		private boolean chiuso;

		// Getters and setters
		public LocalDate getData() {
			return data;
		}

		public void setData(LocalDate data) {
			this.data = data;
		}

		public LocalTime getOraApertura() {
			return oraApertura;
		}

		public void setOraApertura(LocalTime oraApertura) {
			this.oraApertura = oraApertura;
		}

		public LocalTime getOraChiusura() {
			return oraChiusura;
		}

		public void setOraChiusura(LocalTime oraChiusura) {
			this.oraChiusura = oraChiusura;
		}

		public LocalTime getOraInizioPausaPranzo() {
			return oraInizioPausaPranzo;
		}

		public void setOraInizioPausaPranzo(LocalTime oraInizioPausaPranzo) {
			this.oraInizioPausaPranzo = oraInizioPausaPranzo;
		}

		public LocalTime getOraFinePausaPranzo() {
			return oraFinePausaPranzo;
		}

		public void setOraFinePausaPranzo(LocalTime oraFinePausaPranzo) {
			this.oraFinePausaPranzo = oraFinePausaPranzo;
		}

		public boolean isChiuso() {
			return chiuso;
		}

		public void setChiuso(boolean chiuso) {
			this.chiuso = chiuso;
		}
	}
}