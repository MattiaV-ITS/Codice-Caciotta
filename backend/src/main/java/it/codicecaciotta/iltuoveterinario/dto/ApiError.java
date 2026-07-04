package it.codicecaciotta.iltuoveterinario.dto;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;


/**
 * Classe per rappresentare un errore API da restituire al client in caso di eccezioni o errori di validazione.
 */
@Data
public class ApiError {
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors;

    public ApiError(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.fieldErrors = new HashMap<>();
    }

    public void addFieldError(String field, String message) {
        this.fieldErrors.put(field, message);
    }

}