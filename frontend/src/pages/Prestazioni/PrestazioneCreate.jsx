import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../services/apiService';
import FormModal from '../../components/FormModal/FormModal';

function PrestazioneCreate() {
  const { post } = useApi();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomePrestazione: '',
    descrizione: '',
    durataStimata: 30,
    costoBase: 45.00,
    aliquotaIva: 22,
    stato: 'Disponibile',
    colore: '#4299E1',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'nomePrestazione':
        return !value.trim() ? 'Il nome della prestazione è obbligatorio' : '';
      case 'durataStimata':
        return isNaN(value) || value <= 0 ? 'La durata deve essere un numero positivo' : '';
      case 'costoBase':
        return isNaN(value) || value <= 0 ? 'Il costo base deve essere un numero positivo' : '';
      case 'aliquotaIva':
        return isNaN(value) || value < 0 || value > 100 ? 'L\'aliquota IVA deve essere tra 0 e 100' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = ['nomePrestazione', 'durataStimata', 'costoBase', 'aliquotaIva'];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      try {
        const response = await post('/api/prestazioni', {
          ...formData,
          costoBase: parseFloat(formData.costoBase),
          durataStimata: parseInt(formData.durataStimata),
          aliquotaIva: parseInt(formData.aliquotaIva)
        });

        if (response.ok) {
          navigate('/prestazioni');
        } else {
          const errorData = await response.json();
          console.error('Error creating prestazione:', errorData);
        }
      } catch (error) {
        console.error('Error creating prestazione:', error);
      }
    }
  };

  const hasError = (field) => touched[field] && errors[field];

  return (
    <FormModal
      title="Nuova Prestazione"
      onClose={() => navigate('/prestazioni')}
      onSubmit={handleSubmit}
      size="lg"
    >
      <div className="prestazione-form-grid">
        {/* Nome Prestazione */}
        <div className="form-group">
          <label className="form-label">Nome Prestazione *</label>
          <input
            type="text"
            name="nomePrestazione"
            className={`form-control ${hasError('nomePrestazione') ? 'is-invalid' : ''}`}
            value={formData.nomePrestazione}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Es. Visita di controllo"
          />
          {hasError('nomePrestazione') && <div className="form-error">{errors.nomePrestazione}</div>}
        </div>

        {/* Descrizione */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Descrizione</label>
          <textarea
            name="descrizione"
            className="form-control"
            value={formData.descrizione}
            onChange={handleChange}
            rows={3}
            placeholder="Descrizione dettagliata della prestazione..."
          />
        </div>

        {/* Durata Stimata */}
        <div className="form-group">
          <label className="form-label">Durata Stimata (min) *</label>
          <input
            type="number"
            name="durataStimata"
            className={`form-control ${hasError('durataStimata') ? 'is-invalid' : ''}`}
            value={formData.durataStimata}
            onChange={handleChange}
            onBlur={handleBlur}
            min="5"
            max="300"
            step="5"
          />
          {hasError('durataStimata') && <div className="form-error">{errors.durataStimata}</div>}
        </div>

        {/* Costo Base */}
        <div className="form-group">
          <label className="form-label">Costo Base (€) *</label>
          <input
            type="number"
            name="costoBase"
            className={`form-control ${hasError('costoBase') ? 'is-invalid' : ''}`}
            value={formData.costoBase}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            step="0.01"
          />
          {hasError('costoBase') && <div className="form-error">{errors.costoBase}</div>}
        </div>

        {/* Aliquota IVA */}
        <div className="form-group">
          <label className="form-label">Aliquota IVA (%) *</label>
          <input
            type="number"
            name="aliquotaIva"
            className={`form-control ${hasError('aliquotaIva') ? 'is-invalid' : ''}`}
            value={formData.aliquotaIva}
            onChange={handleChange}
            onBlur={handleBlur}
            min="0"
            max="100"
          />
          {hasError('aliquotaIva') && <div className="form-error">{errors.aliquotaIva}</div>}
        </div>

        {/* Stato */}
        <div className="form-group">
          <label className="form-label">Stato</label>
          <select
            name="stato"
            className="form-control"
            value={formData.stato}
            onChange={handleChange}
          >
            <option value="Disponibile">Disponibile</option>
            <option value="Non disponibile">Non disponibile</option>
            <option value="In revisione">In revisione</option>
          </select>
        </div>

        {/* Colore */}
        <div className="form-group">
          <label className="form-label">Colore</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="color"
              name="colore"
              className="form-control-color"
              value={formData.colore}
              onChange={handleChange}
              style={{ width: '50px', height: '50px', padding: '2px' }}
            />
            <input
              type="text"
              name="colore"
              className="form-control"
              value={formData.colore}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Note */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Note</label>
          <textarea
            name="note"
            className="form-control"
            value={formData.note}
            onChange={handleChange}
            rows={2}
            placeholder="Note aggiuntive..."
          />
        </div>
      </div>
    </FormModal>
  );
}

export default PrestazioneCreate;