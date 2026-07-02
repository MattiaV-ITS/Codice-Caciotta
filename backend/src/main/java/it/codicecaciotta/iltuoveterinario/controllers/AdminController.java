package it.codicecaciotta.iltuoveterinario.controllers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.payload.response.MessageResponse;
import it.codicecaciotta.iltuoveterinario.repositories.RuoloRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

	private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

	private final UtenteRepository userRepository;
	private final RuoloRepository roleRepository;

	public AdminController(UtenteRepository userRepository, RuoloRepository roleRepository) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
	}

	@PreAuthorize("hasRole('ADMIN')")
	@Transactional(readOnly = true)
	@GetMapping("/users")
	public ResponseEntity<List<AdminUserResponse>> getUsers() {
		List<AdminUserResponse> users = userRepository.findAll().stream()
				.map(AdminUserResponse::fromEntity)
				.collect(Collectors.toList());

		return ResponseEntity.ok(users);
	}

	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/users/{username}/roles")
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

	private static class RoleLookupException extends RuntimeException {
		private RoleLookupException(String roleName) {
			super("Role not found: " + roleName);
		}
	}
}
