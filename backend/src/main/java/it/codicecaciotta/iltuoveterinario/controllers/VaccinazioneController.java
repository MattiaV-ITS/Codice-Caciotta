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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
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
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > MAX_PAGE_SIZE) {
            size = 15;
        }
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
        
        sortDir = sortDir.toLowerCase().startsWith("desc") ? "desc" : "asc";
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Get paginated vaccinazioni from service
        Page<Vaccinazione> vaccinazioniPage = vaccinazioneService.getAllVaccinazioni(pageable);
        
        // Apply search filter if provided (client-side for now)
        List<Vaccinazione> vaccinazioni = vaccinazioniPage.getContent();
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
        
        // Create response page
        long totalElements = (search != null || stato != null) ? vaccinazioni.size() : vaccinazioniPage.getTotalElements();
        
        // If filtering is applied, we need to handle pagination differently
        if (search != null || stato != null) {
            // Calculate total pages based on filtered results
            int filteredSize = vaccinazioni.size();
            int totalPages = (int) Math.ceil((double) filteredSize / pageable.getPageSize());
            
            // Adjust page number if it's beyond the available pages
            int currentPage = Math.min(pageable.getPageNumber(), totalPages - 1);
            if (currentPage < 0) currentPage = 0;
            
            // Get the correct page of filtered results
            int start = currentPage * pageable.getPageSize();
            int end = Math.min(start + pageable.getPageSize(), filteredSize);
            List<Vaccinazione> paginatedVaccinazioni = vaccinazioni.subList(start, end);
            
            // Convert only the paginated results to DTOs
            List<VaccinazioneListaDTO> paginatedDTOs = paginatedVaccinazioni.stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new PageImpl<>(
                paginatedDTOs, 
                PageRequest.of(currentPage, pageable.getPageSize(), pageable.getSort()), 
                filteredSize
            ));
        } else {
            // No filtering - convert all to DTOs and return
            List<VaccinazioneListaDTO> vaccinazioneListaDTOs = vaccinazioni.stream()
                .map(vaccinazioneListaMapper::toListaDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new PageImpl<>(
                vaccinazioneListaDTOs, 
                pageable, 
                totalElements
            ));
        }
    }


}