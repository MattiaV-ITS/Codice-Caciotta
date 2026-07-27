package it.codicecaciotta.iltuoveterinario.controllers;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleSchedaDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mappers.AnimaleSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Utente;
import it.codicecaciotta.iltuoveterinario.repositories.UtenteRepository;
import it.codicecaciotta.iltuoveterinario.security.services.UserDetailsImpl;
import it.codicecaciotta.iltuoveterinario.services.AnimaleListaServiceImpl;
import it.codicecaciotta.iltuoveterinario.services.AnimaleService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Objects;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/animali")
public class AnimaleController {

    private final AnimaleService animaleService;
    private final AnimaleListaServiceImpl animaleListaService;
    private final PaginationAndSortingUtils paginationAndSortingUtils;

    private final UtenteRepository utenteRepository;

    public AnimaleController(AnimaleService animaleService,
                             AnimaleListaServiceImpl animaleListaService,
                             PaginationAndSortingUtils paginationAndSortingUtils,
                             UtenteRepository utenteRepository) {
        this.animaleService = animaleService;
        this.animaleListaService = animaleListaService;
        this.paginationAndSortingUtils = paginationAndSortingUtils;
        this.utenteRepository = utenteRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Animale> createAnimale(@Valid @RequestBody AnimaleCreateDTO animaleCreateDTO) {
        Animale createdAnimale = animaleService.createAnimale(animaleCreateDTO);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdAnimale.getId())
                .toUri();
        return ResponseEntity.created(location).body(createdAnimale);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<AnimaleSchedaDTO> getAnimaleSchedaById(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Animale animale = animaleService.getAnimaleById(id);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        // For regular users (ROLE_USER), verify they own this animal
        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Utente currentUser = utenteRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            if (currentUser.getProprietario() == null ||
                !currentUser.getProprietario().getId().equals(
                    animale.getProprietario() != null ? animale.getProprietario().getId() : null)) {
                return ResponseEntity.status(403).build();
            }
        }

        AnimaleSchedaDTO schedaDTO = AnimaleSchedaMapper.toSchedaDTO(animale);
        return ResponseEntity.ok(schedaDTO);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Animale> updateAnimale(@PathVariable Long id,
                                                 @Valid @RequestBody AnimaleUpdateDTO animaleUpdateDTO) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        Animale updatedAnimale = animaleService.updateAnimale(id, animaleUpdateDTO);
        return ResponseEntity.ok(updatedAnimale);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAnimale(@PathVariable Long id) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }
        animaleService.deleteAnimale(id);
        return ResponseEntity.noContent().build();
    }

    private static final List<String> ALLOWED_SORT_FIELDS = List.of(
            "id", "nome", "specie", "razza", "dataNascita", "sesso", "microchip", "stato",
            "idProprietario", "proprietario"
    );

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public Page<AnimaleListaDTO> getAnimali(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specie,
            @RequestParam(required = false) String stato,
            @RequestParam(required = false) Long proprietarioId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isStaffOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        // For regular users (ROLE_USER), force filtering by their own proprietarioId
        if (!isStaffOrAdmin) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Utente currentUser = utenteRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new IllegalStateException("User not found"));
            if (currentUser.getProprietario() != null) {
                proprietarioId = currentUser.getProprietario().getId();
            } else {
                // User has no proprietario profile, return empty page
                return Page.empty();
            }
        }

        Pageable pageable = paginationAndSortingUtils.buildPageRequest(
                page, size, sortBy, sortDir, ALLOWED_SORT_FIELDS);

        return animaleListaService.getAnimaliByFilters(search, specie, stato, proprietarioId, pageable);
    }
}