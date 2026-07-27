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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.OrarioBloccato;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.payload.response.MessageResponse;
import it.codicecaciotta.iltuoveterinario.repositories.RuoloRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.services.OrarioBloccatoService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

	private final UtenteRepository userRepository;
	private final RuoloRepository roleRepository;
	private final OrarioBloccatoService orarioBloccatoService;

	public AdminController(UtenteRepository userRepository, RuoloRepository roleRepository,
						 OrarioBloccatoService orarioBloccatoService) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
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
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
			String currentUsername = authentication != null ? authentication.getName() : "admin";

			OrarioBloccato created = orarioBloccatoService.createOrarioBloccato(
					request.getData(),
					request.getOraInizio(),
					request.getOraFine(),
					request.getMotivo(),
					currentUsername
			);

			logger.info("Created blocked time slot: {} {}-{}",
					created.getData(), created.getOraInizio(), created.getOraFine());

			return ResponseEntity.ok(new MessageResponse("Orario bloccato creato con successo"));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
		}
	}

	@PreAuthorize("hasAuthority('ROLE_ADMIN')")
	@PutMapping("/orari/bloccati/{id}")
	public ResponseEntity<?> updateBlockedTimeSlot(@PathVariable Long id, @Valid @RequestBody UpdateBlockedTimeRequest request) {
		try {
			OrarioBloccato updated = orarioBloccatoService.updateOrarioBloccato(
					id,
					request.getData(),
					request.getOraInizio(),
					request.getOraFine(),
					request.getMotivo()
			);
			logger.info("Updated blocked time slot: {} {}-{}",
					updated.getData(), updated.getOraInizio(), updated.getOraFine());
			return ResponseEntity.ok(updated);
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

	public static class UpdateBlockedTimeRequest {
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
