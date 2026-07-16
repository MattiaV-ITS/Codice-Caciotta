package it.codicecaciotta.iltuoveterinario.services;

import org.springframework.lang.NonNull;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;

import it.codicecaciotta.iltuoveterinario.models.Utente;

public interface ProprietarioService {
    Proprietario createProprietario(ProprietarioCreateDTO proprietarioCreateDTO);
    Proprietario createProprietarioForUser(ProprietarioCreateDTO proprietarioCreateDTO, Utente utente);
    Proprietario getProprietarioById(@NonNull Long id);
    Proprietario updateProprietario(@NonNull Long id, ProprietarioUpdateDTO proprietarioUpdateDTO);
    void deleteProprietario(@NonNull Long id);
}