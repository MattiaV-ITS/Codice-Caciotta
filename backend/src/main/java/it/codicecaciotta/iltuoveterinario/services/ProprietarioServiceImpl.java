package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.ProprietarioCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.ProprietarioUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Objects;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProprietarioServiceImpl implements ProprietarioService {

    private final ProprietarioRepository proprietarioRepository;

    public ProprietarioServiceImpl(ProprietarioRepository proprietarioRepository) {
        this.proprietarioRepository = proprietarioRepository;
    }

    @Override
    @Transactional
    public Proprietario createProprietario(ProprietarioCreateDTO proprietarioCreateDTO) {
        // Create
        Proprietario proprietario = new Proprietario();
        proprietario.setCodiceFiscale(proprietarioCreateDTO.getCodiceFiscale());
        proprietario.setNome(proprietarioCreateDTO.getNome());
        proprietario.setCognome(proprietarioCreateDTO.getCognome());
        proprietario.setEmail(proprietarioCreateDTO.getEmail());
        proprietario.setTelefono(proprietarioCreateDTO.getTelefono());
        proprietario.setIndirizzo(proprietarioCreateDTO.getIndirizzo());
        proprietario.setCitta(proprietarioCreateDTO.getCitta());
        proprietario.setDataRegistrazione(proprietarioCreateDTO.getDataRegistrazione());
        proprietario.setStato(proprietarioCreateDTO.getStato());

        // Save
        return proprietarioRepository.save(Objects.requireNonNull(proprietario));
    }

    @Override
    @Transactional(readOnly = true)
    public Proprietario getProprietarioById(@NonNull Long id) {
        return proprietarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proprietario not found with id: " + id));
    }

    @Override
    @Transactional
    public Proprietario updateProprietario(@NonNull Long id, ProprietarioUpdateDTO dto) {

        Proprietario proprietario = proprietarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proprietario not found with id: " + id));

        // Campi non-nullabili: aggiornati solo se presenti
        if (dto.getNome() != null) {
            proprietario.setNome(dto.getNome());
        }
        if (dto.getCognome() != null) {
            proprietario.setCognome(dto.getCognome());
        }
        if (dto.getEmail() != null) {
            proprietario.setEmail(dto.getEmail());
        }
        if (dto.getTelefono() != null) {
            proprietario.setTelefono(dto.getTelefono());
        }
        if (dto.getIndirizzo() != null) {
            proprietario.setIndirizzo(dto.getIndirizzo());
        }
        if (dto.getCitta() != null) {
            proprietario.setCitta(dto.getCitta());
        }
        if (dto.getDataRegistrazione() != null) {
            proprietario.setDataRegistrazione(dto.getDataRegistrazione());
        }
        if (dto.getStato() != null) {
            proprietario.setStato(dto.getStato());
        }

        // Campo nullable: aggiornato solo se presente
        if (dto.getCodiceFiscale() != null) {
            proprietario.setCodiceFiscale(dto.getCodiceFiscale());
        }

        return proprietarioRepository.save(Objects.requireNonNull(proprietario));
    }

    @Override
    @Transactional
    public void deleteProprietario(@NonNull Long id) {
        if (!proprietarioRepository.existsById(id)) {
            throw new EntityNotFoundException("Proprietario not found with id: " + id);
        }

        // Delete
        proprietarioRepository.deleteById(id);
    }
}