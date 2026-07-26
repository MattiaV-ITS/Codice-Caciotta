package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "orari_studio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrarioStudio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private EGiornoSettimana giornoSettimana;

    @Column(name = "ora_apertura")
    private LocalTime oraApertura;

    @Column(name = "ora_chiusura")
    private LocalTime oraChiusura;

    @Column(name = "ora_inizio_pausa_pranzo", nullable = true)
    private LocalTime oraInizioPausaPranzo;

    @Column(name = "ora_fine_pausa_pranzo", nullable = true)
    private LocalTime oraFinePausaPranzo;

    @Column(name = "chiuso")
    @Builder.Default
    private Boolean chiuso = false;

    @Column(name = "data_specifica")
    private LocalDate dataSpecifica;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = true;

    public String getGiornoSettimanaDisplay() {
        if (giornoSettimana == null) return "";
        return switch (giornoSettimana) {
            case LUNEDI -> "Lunedì";
            case MARTEDI -> "Martedì";
            case MERCOLEDI -> "Mercoledì";
            case GIOVEDI -> "Giovedì";
            case VENERDI -> "Venerdì";
            case SABATO -> "Sabato";
            case DOMENICA -> "Domenica";
        };
    }
}