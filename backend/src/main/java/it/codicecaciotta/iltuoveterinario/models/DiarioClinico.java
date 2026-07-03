package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "diario_clinico")
@Data
public class DiarioClinico {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String sintomi;

    @Column(nullable = true)
    private String diagnosi;

    @Column(nullable = true)
    private String trattamentoTerapia;

    @Column(nullable = true)
    private String note;

    @Column(nullable = true)
    private String notePrivate; // Note private visibili solo al veterinario

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Visita visita;
}

