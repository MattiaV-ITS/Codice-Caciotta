package it.codicecaciotta.iltuoveterinario.utils;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

@Component
public class PaginationAndSortingUtils {

    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Builder per PageRequest con validazione dei parametri di impaginazione e ordinamento.
     *
     * @param page numero pagina
     * @param size dimensione pagina
     * @param sortBy campo di ordinamento richiesto
     * @param sortDir direzione ("asc" o "desc")
     * @param allowedSortFields lista dei campi consentiti per questo endpoint
     * @return PageRequest validato
     */
    public @NonNull Pageable buildPageRequest(
            int page,
            int size,
            String sortBy,
            String sortDir,
            List<String> allowedSortFields) {

        // Sananamento dei parametri
        if (page < 0) {
            page = 0;
        }

        if (size <= 0 || size > MAX_PAGE_SIZE) {
            size = 10;
        }

        if (sortBy == null || !allowedSortFields.contains(sortBy)) {
            sortBy = allowedSortFields.get(0); // default: primo campo consentito
        }

        sortDir = (sortDir != null && sortDir.toLowerCase().startsWith("desc"))
                ? "desc"
                : "asc";

        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);

        return PageRequest.of(page, size, sort);
    }
}