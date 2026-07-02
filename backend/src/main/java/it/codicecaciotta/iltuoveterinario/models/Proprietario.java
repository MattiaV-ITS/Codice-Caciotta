package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "proprietari")
@Data
public class Proprietario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 16, max = 16)
    @Column(name = "codice_fiscale", unique = true, nullable = false, length = 16)
    private String codiceFiscale;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cognome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String telefono;

    @Column(nullable = false)
    private String indirizzo;

    @Column(nullable = false)
    private String citta;

    @Column(nullable = false)
    private LocalDateTime dataRegistrazione;

    
    @Column(name = "stato_attività", nullable = false, 
    columnDefinition = "VARCHAR(20) CHECK (stato IN ('Attivo', 'Inattivo'))")
    private String statoAttivita = "Attivo";
    
    @OneToMany(mappedBy = "proprietario", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<Animale> animali = new HashSet<>();

    // Metodo helper per mantenere sincronizzati i due lati della relazione
    public void addAnimal(Animale animale) {
        animali.add(animale);
        animale.setProprietario(this);
    }

    public void removeAnimal(Animale animale) {
        animali.remove(animale);
        animale.setProprietario(null);
    }
    
    @PrePersist
    public void onCreate() {
        dataRegistrazione = LocalDateTime.now();
    }
}