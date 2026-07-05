package it.codicecaciotta.iltuoveterinario.controllers;

import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneListaDTO;
import it.codicecaciotta.iltuoveterinario.dto.VaccinazioneUpdateDTO;
import it.codicecaciotta.iltuoveterinario.mapper.VaccinazioneListaMapper;
import it.codicecaciotta.iltuoveterinario.models.EStatoVaccinazione;
import it.codicecaciotta.iltuoveterinario.models.Vaccinazione;
import it.codicecaciotta.iltuoveterinario.services.VaccinazioneService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/vaccinazioni")
public class VaccinazioneController {

    private final VaccinazioneService vaccinazioneService;
    private final VaccinazioneListaMapper vaccinazioneListaMapper;
    private static final int MAX_PAGE_SIZE = 100;
    private static final String[] ALLOWED_SORT_FIELDS = {"id", "tipoVaccino", "dataSomministrazione", "dataScadenza", "lotto"};

    public VaccinazioneController(VaccinazioneService vaccinazioneService, VaccinazioneListaMapper vaccinazioneListaMapper) {
        this.vaccinazioneService = vaccinazioneService;
        this.vaccinazioneListaMapper = vaccinazioneListaMapper;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> createVaccinazione(@Valid @RequestBody VaccinazioneCreateDTO vaccinazioneCreateDTO) {
        Vaccinazione createdVaccinazione = vaccinazioneService.createVaccinazione(vaccinazioneCreateDTO);
        
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdVaccinazione.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdVaccinazione);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> updateVaccinazione(@PathVariable @NonNull Long id, @Valid @RequestBody VaccinazioneUpdateDTO vaccinazioneUpdateDTO) {
        Vaccinazione updatedVaccinazione = vaccinazioneService.updateVaccinazione(id, vaccinazioneUpdateDTO);
        return ResponseEntity.ok(updatedVaccinazione);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteVaccinazione(@PathVariable @NonNull Long id) {
        vaccinazioneService.deleteVaccinazione(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Vaccinazione> getVaccinazioneById(@PathVariable @NonNull Long id) {
        Vaccinazione vaccinazione = vaccinazioneService.getVaccinazioneById(id);
        return ResponseEntity.ok(vaccinazione);
    }

    @GetMapping("/animale/{animaleId}")
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<VaccinazioneListaDTO>> getVaccinazioniByAnimaleId(@PathVariable @NonNull Long animaleId) {
        List<Vaccinazione> vaccinazioni = vaccinazioneService.getVaccinazioniByAnimaleId(animaleId);
        List<VaccinazioneListaDTO> vaccinazioneListaDTOs = vaccinazioni.stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(vaccinazioneListaDTOs);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_STAFF') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<VaccinazioneListaDTO>> getAllVaccinazioni(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "dataScadenza") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String stato
    ) {
        // Validate and sanitize pagination parameters
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            size = 15;
        }
        
        // Validate sortBy to prevent injection
        boolean validField = false;
        for (String field : ALLOWED_SORT_FIELDS) {
            if (field.equals(sortBy)) {
                validField = true;
                break;
            }
        }
        if (!validField) {
            sortBy = "dataScadenza";
        }
        
        // Normalize sort direction
        sortDir = sortDir.toLowerCase().startsWith("desc") ? "desc" : "asc";
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Get ALL vaccinazioni from service (not paginated) for filtering
        List<Vaccinazione> vaccinazioni = vaccinazioneService.getAllVaccinazioni();
        
        // Apply search filter if provided
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = search.trim().toLowerCase();
            vaccinazioni = vaccinazioni.stream()
                .filter(v ->
                    (v.getTipoVaccino() != null && v.getTipoVaccino().toLowerCase().contains(searchTerm)) ||
                    (v.getLotto() != null && v.getLotto().toLowerCase().contains(searchTerm)) ||
                    (v.getAnimale() != null && v.getAnimale().getNome() != null && v.getAnimale().getNome().toLowerCase().contains(searchTerm))
                )
                .collect(Collectors.toList());
        }
        
        // Apply status filter if provided
        if (stato != null && !stato.trim().isEmpty()) {
            try {
                EStatoVaccinazione statoFilter = EStatoVaccinazione.valueOf(stato.trim().toUpperCase());
                vaccinazioni = vaccinazioni.stream()
                    .filter(v -> vaccinazioneService.calculateStatoVaccinazione(v) == statoFilter)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status value, ignore filter
            }
        }
        
        // Apply pagination to filtered results
        int totalElements = vaccinazioni.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        // Adjust page number if it's beyond the available pages
        int currentPage = page;
        if (currentPage >= totalPages && totalPages > 0) {
            currentPage = totalPages - 1;
        }
        
        // Get the correct page of results
        int start = currentPage * size;
        int end = Math.min(start + size, totalElements);
        List<Vaccinazione> paginatedVaccinazioni = vaccinazioni.subList(start, end);
        
        // Convert to DTOs
        List<VaccinazioneListaDTO> vaccinazioneListaDTOs = paginatedVaccinazioni.stream()
            .map(vaccinazioneListaMapper::toListaDTO)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(new PageImpl<>(
            vaccinazioneListaDTOs,
            PageRequest.of(currentPage, size, sort),
            totalElements
        ));
    }
}