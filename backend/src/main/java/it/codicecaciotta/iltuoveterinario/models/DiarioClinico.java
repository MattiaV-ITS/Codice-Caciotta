package it.codicecaciotta.iltuoveterinario.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
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
}
