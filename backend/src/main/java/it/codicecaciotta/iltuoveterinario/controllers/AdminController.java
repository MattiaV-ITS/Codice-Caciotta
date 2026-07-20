package it.codicecaciotta.iltuoveterinario.controllers;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.EGiornoSettimana;
import it.codicecaciotta.iltuoveterinario.models.OrarioBloccato;
import it.codicecaciotta.iltuoveterinario.models.OrarioStudio;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.payload.response.MessageResponse;
import it.codicecaciotta.iltuoveterinario.repositories.RuoloRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.services.OrarioBloccatoService;
import it.codicecaciotta.iltuoveterinario.services.OrarioStudioService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

	private final UtenteRepository userRepository;
	private final RuoloRepository roleRepository;
	private final OrarioStudioService orarioStudioService;
	private final OrarioBloccatoService orarioBloccatoService;

	public AdminController(UtenteRepository userRepository, RuoloRepository roleRepository,
						 OrarioStudioService orarioStudioService, OrarioBloccatoService orarioBloccatoService) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.orarioStudioService = orarioStudioService;
		this.orarioBloccatoService = orarioBloccatoService;
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("/users")
	public ResponseEntity<List<AdminUserResponse>> getUsers() {
		List<AdminUserResponse> users = userRepository.findAll().stream()
				.map(AdminUserResponse::fromEntity)
				.collect(Collectors.toList());

		return ResponseEntity.ok(users);
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PatchMapping("/users/{username}/roles")
	public ResponseEntity<?> updateUserRoles(
			@PathVariable String username,
			@Valid @RequestBody UpdateUserRolesRequest request) {
		if (request.getRoles() == null || request.getRoles().isEmpty()) {
			return ResponseEntity.badRequest().body(new MessageResponse("At least one role is required"));
		}

		Utente user = userRepository.findByUsername(username).orElse(null);
		if (user == null) {
			return ResponseEntity.status(404).body(new MessageResponse("User not found: " + username));
		}

		Set<Ruolo> roles;
		try {
			roles = request.getRoles().stream()
					.map(roleName -> {
						ERuoli roleEnum = ERuoli.valueOf(roleName);
						return roleRepository.findByNome(roleEnum)
								.orElseThrow(() -> new RoleLookupException(roleName));
					})
					.collect(Collectors.toSet());
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
		}

		user.setRuoli(roles);
		userRepository.save(user);

		logger.info("Roles {} assigned to user '{}'", request.getRoles(), username);
		return ResponseEntity.ok(new MessageResponse("Roles updated successfully"));
	}

	public static class AdminUserResponse {
		private Long id;
		private String username;
		private String email;
		private Set<String> roles;

		public static AdminUserResponse fromEntity(Utente user) {
			AdminUserResponse response = new AdminUserResponse();
			response.setId(user.getId());
			response.setUsername(user.getUsername());
			response.setEmail(user.getEmail());
			response.setRoles(user.getRuoli() == null ? java.util.Collections.emptySet() : user.getRuoli().stream()
					.map(role -> role.getNome().name())
					.collect(Collectors.toSet()));
			return response;
		}

		public Long getId() {
			return id;
		}

		public void setId(Long id) {
			this.id = id;
		}

		public String getUsername() {
			return username;
		}

		public void setUsername(String username) {
			this.username = username;
		}

		public String getEmail() {
			return email;
		}

		public void setEmail(String email) {
			this.email = email;
		}

		public Set<String> getRoles() {
			return roles;
		}

		public void setRoles(Set<String> roles) {
			this.roles = roles;
		}
	}

	public static class UpdateUserRolesRequest {
		@NotEmpty
		private Set<String> roles;

		public Set<String> getRoles() {
			return roles;
		}

		public void setRoles(Set<String> roles) {
			this.roles = roles;
		}
	}

	// =======================================
	// BLOCKED TIME SLOTS MANAGEMENT ENDPOINTS
	// =======================================

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("/orari/bloccati")
	public ResponseEntity<List<OrarioBloccato>> getAllBlockedTimes() {
		List<OrarioBloccato> blockedTimes = orarioBloccatoService.getAllOrariBloccati();
		return ResponseEntity.ok(blockedTimes);
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("/orari/bloccati/{data}")
	public ResponseEntity<List<OrarioBloccato>> getBlockedTimesByDate(@PathVariable LocalDate data) {
		List<OrarioBloccato> blockedTimes = orarioBloccatoService.getOrariBloccatiByData(data);
		return ResponseEntity.ok(blockedTimes);
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PostMapping("/orari/bloccati")
	public ResponseEntity<?> createBlockedTimeSlot(@Valid @RequestBody CreateBlockedTimeRequest request) {
		try {
			OrarioBloccato created = orarioBloccatoService.createOrarioBloccato(
					request.getData(),
					request.getOraInizio(),
					request.getOraFine(),
					request.getMotivo(),
					"admin" // TODO: Get from authentication
			);

			logger.info("Created blocked time slot: {} {}-{}",
					created.getData(), created.getOraInizio(), created.getOraFine());

			return ResponseEntity.ok(new MessageResponse("Orario bloccato creato con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@DeleteMapping("/orari/bloccati/{id}")
	public ResponseEntity<?> deleteBlockedTimeSlot(@PathVariable Long id) {
		try {
			orarioBloccatoService.deleteOrarioBloccato(id);
			logger.info("Deleted blocked time slot with ID: {}", id);
			return ResponseEntity.ok(new MessageResponse("Orario bloccato rimosso con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	// =======================================
	// STUDIO HOURS MANAGEMENT ENDPOINTS
	// =======================================

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("/orari")
	public ResponseEntity<StudioHoursResponse> getAllStudioHours() {
		List<OrarioStudio> defaultOrari = orarioStudioService.getAllDefaultOrari();
		List<OrarioStudio> specificOrari = orarioStudioService.getAllSpecificOrari();

		StudioHoursResponse response = new StudioHoursResponse();
		response.setDefaultOrari(defaultOrari);
		response.setSpecificOrari(specificOrari);

		return ResponseEntity.ok(response);
	}

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/orari/default")
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
    @PutMapping("/orari/default/all")
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
    @PutMapping("/orari/default/with-lunch")
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
	@PostMapping("/orari/specific")
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
	@PostMapping("/orari/specific/with-lunch")
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
	@DeleteMapping("/orari/specific/{id}")
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

	public static class CreateBlockedTimeRequest {
		@NotNull
		private LocalDate data;

		@NotNull
		private LocalTime oraInizio;

		@NotNull
		private LocalTime oraFine;

		private String motivo;

		// Getters and setters
		public LocalDate getData() {
			return data;
		}

		public void setData(LocalDate data) {
			this.data = data;
		}

		public LocalTime getOraInizio() {
			return oraInizio;
		}

		public void setOraInizio(LocalTime oraInizio) {
			this.oraInizio = oraInizio;
		}

		public LocalTime getOraFine() {
			return oraFine;
		}

		public void setOraFine(LocalTime oraFine) {
			this.oraFine = oraFine;
		}

		public String getMotivo() {
			return motivo;
		}

		public void setMotivo(String motivo) {
			this.motivo = motivo;
		}
	}

	private static class RoleLookupException extends RuntimeException {
		private RoleLookupException(String roleName) {
			super("Role not found: " + roleName);
		}
	}
}
