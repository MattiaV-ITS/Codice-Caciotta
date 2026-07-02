package it.codicecaciotta.iltuoveterinario.security.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import jakarta.transaction.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
  final UtenteRepository utenteRepository;

  UserDetailsServiceImpl(UtenteRepository utenteRepository) {
    this.utenteRepository = utenteRepository;
  }

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    Utente utente = utenteRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("No user found with username: " + username));

    return UserDetailsImpl.build(utente);
  }

}