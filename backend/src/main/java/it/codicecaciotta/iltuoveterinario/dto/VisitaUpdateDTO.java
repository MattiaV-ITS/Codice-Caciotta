package it.codicecaciotta.iltuoveterinario.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO per update parziale di un proprietario. Tutti i campi sono opzionali.
 */
@Data
public class VisitaUpdateDTO {
    
}
