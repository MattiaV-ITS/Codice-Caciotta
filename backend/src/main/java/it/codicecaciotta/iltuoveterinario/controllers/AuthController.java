package it.codicecaciotta.iltuoveterinario.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import it.codicecaciotta.iltuoveterinario.models.ERuoli;
import it.codicecaciotta.iltuoveterinario.models.Ruolo;
import it.codicecaciotta.iltuoveterinario.models.Utente;
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
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600) // TODO: Change this to your frontend URL in production
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @Autowired
  private AuthenticationManager authenticationManager;

  @Autowired
  private UtenteRepository userRepository;

  @Autowired
  private RuoloRepository roleRepository;

  @Autowired
  private PasswordEncoder encoder;

  @Autowired
  private JwtUtils jwtUtils;

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
    } catch (BadCredentialsException ex) {
      logger.warn("Authentication failed for user '{}'", loginRequest.getUsername());
      return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid username or password"));
    }
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    Utente user = new Utente(signUpRequest.getUsername(), signUpRequest.getEmail(),
        encoder.encode(signUpRequest.getPassword()));

    Set<String> strRoles = signUpRequest.getRole();
    Set<Ruolo> roles = new HashSet<>();

    if (strRoles == null || strRoles.isEmpty()) {
      Ruolo userRole = roleRepository.findByNome(ERuoli.ROLE_USER)
          .orElseThrow(() -> new IllegalStateException("Error: Default role USER not found."));
      roles.add(userRole);
    } else {
      for (String role : strRoles) {
        switch (role.toLowerCase()) {
          case "admin":
            Ruolo adminRole = roleRepository.findByNome(ERuoli.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Error: Role ADMIN not found."));
            roles.add(adminRole);
            break;
          case "staff":
            Ruolo staffRole = roleRepository.findByNome(ERuoli.ROLE_STAFF)
                .orElseThrow(() -> new IllegalStateException("Error: Role STAFF not found."));
            roles.add(staffRole);
            break;
          case "user":
            Ruolo userRole = roleRepository.findByNome(ERuoli.ROLE_USER)
                .orElseThrow(() -> new IllegalStateException("Error: Role USER not found."));
            roles.add(userRole);
            break;
          default:
            logger.warn("Unknown role '{}' requested during signup for user '{}'", role, signUpRequest.getUsername());
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Role '" + role + "' is not valid."));
        }
      }
    }

    user.setRuoli(roles);
    userRepository.save(user);

    logger.info("User '{}' registered successfully with roles {}", user.getUsername(), roles.stream()
        .map(r -> r.getNome().name()).collect(Collectors.toList()));

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }
}
