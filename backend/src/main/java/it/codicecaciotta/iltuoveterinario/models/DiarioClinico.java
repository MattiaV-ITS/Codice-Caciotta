package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import lombok.Data;

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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    private Visita visita;
}
