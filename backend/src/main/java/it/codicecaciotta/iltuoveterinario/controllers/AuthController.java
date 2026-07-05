package it.codicecaciotta.iltuoveterinario.controllers;

import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.payload.request.LoginRequest;
import it.codicecaciotta.iltuoveterinario.payload.request.SignupRequest;
import it.codicecaciotta.iltuoveterinario.payload.response.JwtResponse;
import it.codicecaciotta.iltuoveterinario.payload.response.MessageResponse;
import it.codicecaciotta.iltuoveterinario.repositories.RuoloRepository;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.security.jwt.JwtUtils;
import it.codicecaciotta.iltuoveterinario.security.services.UserDetailsImpl;

@RestController
@RequestMapping("/api/auth")
// TODO: Esternalizzare l'origine consentita in un file di configurazione o variabile d'ambiente
@CrossOrigin(origins = "${app.cors.allowedOrigins:http://localhost:5173}", maxAge = 3600)
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  private final AuthenticationManager authenticationManager;
  private final UtenteRepository userRepository;
  private final RuoloRepository roleRepository;
  private final PasswordEncoder encoder;
  private final JwtUtils jwtUtils;

  public AuthController(AuthenticationManager authenticationManager,
                        UtenteRepository userRepository,
                        RuoloRepository roleRepository,
                        PasswordEncoder encoder,
                        JwtUtils jwtUtils) {
    this.authenticationManager = authenticationManager;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.encoder = encoder;
    this.jwtUtils = jwtUtils;
  }

  /**
   * Autentifica un utente e genera un token JWT se le credenziali sono valide.
   *
   * @param loginRequest la richiesta di login contenente username e password
   * @return ResponseEntity con JWT e informazioni sull'utente autenticato o un messaggio di errore
   */
  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

      SecurityContextHolder.getContext().setAuthentication(authentication);
      String jwt = jwtUtils.generateJwtToken(authentication);

      UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
      List<String> roles = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .collect(Collectors.toList());

      logger.info("User '{}' authenticated successfully", userDetails.getUsername());

      return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(),
          userDetails.getEmail(), roles));
    } catch (AuthenticationException ex) {
      logger.warn("Authentication failed for user '{}'", loginRequest.getUsername());
      return ResponseEntity.status(401).body(new MessageResponse("Errore: Username o password non validi"));
    }
  }

  /**
   * Registra un nuovo utente con il ruolo predefinito ROLE_USER.
   *
   * @param signUpRequest la richiesta di registrazione contenente username, email e password
   * @return ResponseEntity con messaggio di successo o errore
   */
  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Errore: Username esistente!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Errore: Email già in uso!"));
    }

    // Creazione del nuovo utente con password codificata
    Utente user = new Utente(signUpRequest.getUsername(), signUpRequest.getEmail(),
        encoder.encode(signUpRequest.getPassword()));

    Set<Ruolo> roles = new HashSet<>();
    Ruolo userRole = roleRepository.findByNome(ERuoli.ROLE_USER)
        .orElseThrow(() -> new IllegalStateException("Error: Default role USER not found."));
    roles.add(userRole);
    user.setRuoli(roles);

    userRepository.save(user);

    logger.info("User '{}' registered successfully with roles {}",
        user.getUsername(),
        roles.stream().map(r -> r.getNome().name()).collect(Collectors.toList()));

    return ResponseEntity.ok(new MessageResponse("Utente registrato con successo!"));
  }

  /**
   * Test endpoint per controllare gli headers ricevuti (per debugging)
   */
  @GetMapping("/test/headers")
  public ResponseEntity<?> testHeaders() {
    logger.info("Test headers endpoint called");
    return ResponseEntity.ok().body("Headers test endpoint");
  }
}
