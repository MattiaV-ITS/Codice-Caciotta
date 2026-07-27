package it.codicecaciotta.iltuoveterinario.repositories;

import it.codicecaciotta.iltuoveterinario.models.DocumentoAllegato;
import it.codicecaciotta.iltuoveterinario.models.ETipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentoAllegatoRepository extends JpaRepository<DocumentoAllegato, Long> {

    List<DocumentoAllegato> findByAnimaleId(Long animaleId);

    List<DocumentoAllegato> findByVisitaId(Long visitaId);

    List<DocumentoAllegato> findByFatturaId(Long fatturaId);

    List<DocumentoAllegato> findByAnimaleIdAndTipoDocumento(Long animaleId, ETipoDocumento tipoDocumento);

    List<DocumentoAllegato> findByAnimaleIdAndVisitaIdIsNull(Long animaleId);

    List<DocumentoAllegato> findByAnimaleIdAndVisitaId(Long animaleId, Long visitaId);
}