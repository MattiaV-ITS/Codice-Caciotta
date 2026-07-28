package it.codicecaciotta.iltuoveterinario;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.repositories.RuoloRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;

@SpringBootApplication
public class IltuoveterinarioApplication {
	private static final Logger logger = LoggerFactory.getLogger(IltuoveterinarioApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(IltuoveterinarioApplication.class, args);
	}

	// Testing database connection on startup
	@Bean
	public CommandLineRunner testDatabaseConnection(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.queryForObject("SELECT version()", String.class);
				logger.info("Database connection successful");
			} catch (Exception e) {
				logger.error("Database connection failed", e);
			}
		};
	}

	@Bean
	public CommandLineRunner seedSecurityData(
			RuoloRepository roleRepository,
			UtenteRepository userRepository,
			PasswordEncoder passwordEncoder,
			@Value("${APP_ADMIN_USERNAME:admin}") String adminUsername,
			@Value("${APP_ADMIN_EMAIL:admin@example.com}") String adminEmail,
			@Value("${APP_ADMIN_PASSWORD:Admin123!}") String adminPassword) {
		return args -> {
			Set<Ruolo> roles = EnumSet.allOf(ERuoli.class).stream()
					.map(roleName -> roleRepository.findByNome(roleName)
							.orElseGet(() -> {
								Ruolo role = new Ruolo();
								role.setNome(roleName);
								return roleRepository.save(role);
							}))
					.collect(Collectors.toCollection(HashSet::new));

			Utente adminUser = userRepository.findByUsername(adminUsername).orElseGet(() -> {
				Utente user = new Utente(adminUsername, adminEmail, passwordEncoder.encode(adminPassword));
				return userRepository.save(user);
			});

			adminUser.setRuoli(new HashSet<>(roles));
			userRepository.save(adminUser);
		};
	}
}
