package it.codicecaciotta.iltuoveterinario.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;



import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "animali")
@Data
public class Animale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String specie;

    @Column(nullable = true) // Razza puo essere null per alcune specie, quindi non è obbligatorio
    private String razza;

    @Column(name = "data_di_nascita", nullable = false)
    private LocalDate dataNascita;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING) // M, F, null
    private ESesso sesso;

    @Column(nullable = false)
    private BigDecimal peso;

    @Column(length = 15, nullable = true, unique = true) // Non tutte le specie hanno il microchip. Microchip univoco
    @Size(min = 15, max = 15, message = "Il microchip deve avere esattamente 15 caratteri") // Per validazione lunghezza
    private String microchip;

    @Column(nullable = true) 
    @Enumerated(EnumType.STRING) //PICCOLA, MEDIA, GRANDE, null
    private ETaglia taglia;

    @Column(name = "colore_mantello", nullable = true) // Colore mantello puo essere null per alcune specie, quindi non è obbligatorio
    private String coloreMantello;

    @Column(nullable = true) // Sterilizzazione opzionale, default false
    private Boolean sterilizzato = false;

    @Column(name = "gruppo_sanguigno", nullable = true) // Alcune specie non hanno gruppo sanguigno, quindi non è obbligatorio
    private String gruppoSanguigno;

    @Column(nullable = true) // Allergie opzionali
    private String allergie;

    @Column(nullable = true) // Patologie opzionali
    private String patologie;

    @Column(name = "stato", nullable = false) // indica lo stato di salute dell'animale, sano, deceduto, vaccino scaduto, in cura,...
    @Enumerated(EnumType.STRING)
    private EStatoAnimale stato = EStatoAnimale.SANO; // sano di default

    @Column(name = "note_generali", nullable = true) // Note opzionali
    private String noteGenerali;

    @Column(name = "note_private", nullable = true) // Note private opzionali
    private String notePrivate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonBackReference
    private Proprietario proprietario;

    @OneToMany(mappedBy = "animale", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    @JsonManagedReference
    private Set<Vaccinazione> vaccinazioni = new HashSet<>();

    // Metodo helper per mantenere sincronizzati i due lati della relazione
    public void addVaccinazione(Vaccinazione vaccinazione) {
        vaccinazioni.add(vaccinazione);
        vaccinazione.setAnimale(this);
    }

    public void removeVaccinazione(Vaccinazione vaccinazione) {
        vaccinazioni.remove(vaccinazione);
        vaccinazione.setAnimale(null);
    }
}
