package it.codicecaciotta.iltuoveterinario.controllers;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleSchedaDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mappers.AnimaleSchedaMapper;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.services.AnimaleListaServiceImpl;
import it.codicecaciotta.iltuoveterinario.services.AnimaleService;
import it.codicecaciotta.iltuoveterinario.utils.PaginationAndSortingUtils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/animali")
public class AnimaleController {

    private final AnimaleService animaleService;
    private final AnimaleListaServiceImpl animaleListaService;
    private final PaginationAndSortingUtils paginationAndSortingUtils;

    public AnimaleController(AnimaleService animaleService,
                             AnimaleListaServiceImpl animaleListaService,
                             PaginationAndSortingUtils paginationAndSortingUtils) {
        this.animaleService = animaleService;
        this.animaleListaService = animaleListaService;
        this.paginationAndSortingUtils = paginationAndSortingUtils;
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
    public Page<AnimaleListaDTO> getAnimali(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specie,
            @RequestParam(required = false) String stato,
            @RequestParam(required = false) Long proprietarioId) {

        Pageable pageable = paginationAndSortingUtils.buildPageRequest(
                page, size, sortBy, sortDir, ALLOWED_SORT_FIELDS);

        return animaleListaService.getAnimaliByFilters(search, specie, stato, proprietarioId, pageable);
    }
}