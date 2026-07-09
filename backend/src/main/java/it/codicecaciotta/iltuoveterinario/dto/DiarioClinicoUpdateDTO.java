package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;

@Data
public class DiarioClinicoUpdateDTO {

    private String sintomi;

    private String diagnosi;

    private String trattamentoTerapia;

    private String note;

    private String notePrivate;
}
