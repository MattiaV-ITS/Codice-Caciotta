package it.codicecaciotta.iltuoveterinario.services;

import org.springframework.lang.NonNull;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import jakarta.validation.constraints.NotNull;

public interface ProprietarioService {
    Proprietario createProprietario(ProprietarioCreateDTO proprietarioCreateDTO);
    Proprietario updateProprietario(@NonNull Long id, ProprietarioUpdateDTO proprietarioUpdateDTO);
    void deleteProprietario(@NotNull Long id);
}