package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "propietari")
@Data
public class Propietario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cognome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String telefono;

    @Column(nullable = false)
    private String indirizzo;

    @Column(nullable = false)
    private String citta;

    @Column(nullable = false)
    private LocalDate dataRegistrazione;

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
}