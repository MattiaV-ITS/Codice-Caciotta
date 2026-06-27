package it.codicecaciotta.iltuoveterinario;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class IltuoveterinarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(IltuoveterinarioApplication.class, args);
	}

	// Testing database connection on startup
	@Bean
	public CommandLineRunner testDatabaseConnection(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				String result = jdbcTemplate.queryForObject("SELECT version()", String.class);
				System.out.println("Connesso a PostgreSQL, versione: " + result);
			} catch (Exception e) {
				System.err.println("Connessione fallita a PostgreSQL; errore: " + e.getMessage());
			}
		};
	}
}
