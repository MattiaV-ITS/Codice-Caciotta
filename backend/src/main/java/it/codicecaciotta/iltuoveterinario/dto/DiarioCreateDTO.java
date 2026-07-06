package it.codicecaciotta.iltuoveterinario.dto;

import lombok.Data;

@Data
public class DiarioCreateDTO {

    private String sintomi;

    private String diagnosi;

    private String trattamentoTerapia;

    private String note;

    private String notePrivate;
}
