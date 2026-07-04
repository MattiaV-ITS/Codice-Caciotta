package it.codicecaciotta.iltuoveterinario.services;

import it.codicecaciotta.iltuoveterinario.dto.AnimaleCreateDTO;
import it.codicecaciotta.iltuoveterinario.dto.AnimaleUpdateDTO;
import it.codicecaciotta.iltuoveterinario.models.Animale;
import it.codicecaciotta.iltuoveterinario.models.Proprietario;
import it.codicecaciotta.iltuoveterinario.repositories.AnimaleRepository;
import it.codicecaciotta.iltuoveterinario.repositories.ProprietarioRepository;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AnimaleServiceImpl implements AnimaleService {

    private final AnimaleRepository animaleRepository;
    private final ProprietarioRepository proprietarioRepository;

    public AnimaleServiceImpl(AnimaleRepository animaleRepository, ProprietarioRepository proprietarioRepository) {
        this.animaleRepository = animaleRepository;
        this.proprietarioRepository = proprietarioRepository;
    }

    @Override
    @Transactional
    public Animale createAnimale(AnimaleCreateDTO animaleCreateDTO) {
        // Create
        Animale animale = new Animale();
        animale.setNome(animaleCreateDTO.getNome());
        animale.setSpecie(animaleCreateDTO.getSpecie());
        animale.setRazza(animaleCreateDTO.getRazza());
        animale.setDataNascita(animaleCreateDTO.getDataNascita());
        animale.setSesso(animaleCreateDTO.getSesso());
        animale.setPeso(animaleCreateDTO.getPeso());
        animale.setMicrochip(animaleCreateDTO.getMicrochip());
        animale.setTaglia(animaleCreateDTO.getTaglia());
        animale.setColoreMantello(animaleCreateDTO.getColoreMantello());
        animale.setSterilizzato(animaleCreateDTO.isSterilizzato());
        animale.setGruppoSanguigno(animaleCreateDTO.getGruppoSanguigno());
        animale.setAllergie(animaleCreateDTO.getAllergie());
        animale.setPatologie(animaleCreateDTO.getPatologie());
        animale.setStato(animaleCreateDTO.getStato());
        animale.setNoteGenerali(animaleCreateDTO.getNoteGenerali());

        if (animaleCreateDTO.getProprietarioId() != null) {
            Proprietario proprietario = proprietarioRepository.findById(animaleCreateDTO.getProprietarioId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Proprietario not found with id: " + animaleCreateDTO.getProprietarioId()));
            animale.setProprietario(proprietario);
        }

        // Save
        return animaleRepository.save(animale);
    }

    @Override
    @Transactional
    public Animale updateAnimale(@NonNull Long id, AnimaleUpdateDTO dto) {

        Animale animale = animaleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Animale not found with id: " + id));

        // Campi non-nullabili: se presenti, aggiorna
        if (dto.getNome() != null) {
            animale.setNome(dto.getNome());
        }
        if (dto.getSpecie() != null) {
            animale.setSpecie(dto.getSpecie());
        }
        if (dto.getDataNascita() != null) {
            animale.setDataNascita(dto.getDataNascita());
        }
        if (dto.getPeso() != null) {
            animale.setPeso(dto.getPeso());
        }
        if (dto.getStato() != null) {
            animale.setStato(dto.getStato());
        }

        // Campi nullable: aggiornati solo se presenti
        if (dto.getRazza() != null) {
            animale.setRazza(dto.getRazza());
        }
        if (dto.getSesso() != null) {
            animale.setSesso(dto.getSesso());
        }
        if (dto.getMicrochip() != null) {
            animale.setMicrochip(dto.getMicrochip());
        }
        if (dto.getTaglia() != null) {
            animale.setTaglia(dto.getTaglia());
        }
        if (dto.getColoreMantello() != null) {
            animale.setColoreMantello(dto.getColoreMantello());
        }
        if (dto.getSterilizzato() != null) {
            animale.setSterilizzato(dto.getSterilizzato());
        }
        if (dto.getGruppoSanguigno() != null) {
            animale.setGruppoSanguigno(dto.getGruppoSanguigno());
        }
        if (dto.getAllergie() != null) {
            animale.setAllergie(dto.getAllergie());
        }
        if (dto.getPatologie() != null) {
            animale.setPatologie(dto.getPatologie());
        }
        if (dto.getNoteGenerali() != null) {
            animale.setNoteGenerali(dto.getNoteGenerali());
        }
        if (dto.getNotePrivate() != null) {
            animale.setNotePrivate(dto.getNotePrivate());
        }

        // Proprietario: aggiorna se proprietarioId ha un valore
        if (dto.getProprietarioId() != null) {
            Proprietario proprietario = proprietarioRepository.findById(dto.getProprietarioId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Proprietario not found with id: " + dto.getProprietarioId()));
            animale.setProprietario(proprietario);
        }

        return animaleRepository.save(animale);
    }

    @Override
    @Transactional
    public void deleteAnimale(@NonNull Long id) {
        // Controlla se l'animale esiste prima di tentare di eliminarlo
        if (!animaleRepository.existsById(id)) {
            throw new EntityNotFoundException("Animale not found with id: " + id);
        }

        // Delete
        animaleRepository.deleteById(id);
    }
}