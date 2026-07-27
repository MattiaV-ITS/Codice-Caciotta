// components/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import ProprietarioRegistrationModal from './ProprietarioRegistrationModal';
import './Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProprietarioModal, setShowProprietarioModal] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[@#$%^&+=!]/.test(password);
    return minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
  };

  const getPasswordErrors = () => {
    const errors = [];
    if (formData.password.length < 8) errors.push('almeno 8 caratteri');
    if (!/[A-Z]/.test(formData.password)) errors.push('1 maiuscola');
    if (!/[a-z]/.test(formData.password)) errors.push('1 minuscola');
    if (!/[0-9]/.test(formData.password)) errors.push('1 numero');
    if (!/[@#$%^&+=!]/.test(formData.password)) errors.push('1 carattere speciale (@#$%^&+=!)');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    if (!validatePassword(formData.password)) {
      const errors = getPasswordErrors();
      setError(`La password deve contenere: ${errors.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Registra l'utente
      await AuthService.signup(
        formData.username,
        formData.email,
        formData.password,
        ['user']
      );

      // 2. Effettua l'auto-login per ottenere il token JWT (necessario per le chiamate successive)
      const loginData = await AuthService.login(
        formData.username,
        formData.password
      );
      login(loginData.token, loginData.user);

      setSuccess('Registrazione completata!');
      // Show proprietario creation modal instead of immediately navigating to login
      setShowProprietarioModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProprietarioSuccess = () => {
    setSuccess('Profilo proprietario creato con successo!');
    setTimeout(() => navigate('/'), 2000);
  };

  const handleProprietarioSkip = () => {
    setSuccess('Registrazione completata!');
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="auth-container">
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div className="card-header">
          <h3>Registrati</h3>
        </div>
        <div className="card-body">
          <p className="auth-subtitle">Crea il tuo account per accedere al sistema.</p>
          
          {error && <div className="form-error">{error}</div>}
          {success && !showProprietarioModal && <div className="form-success" style={{ 
            background: '#D1FAE5', 
            color: '#065F46', 
            padding: '12px', 
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--space-4)'
          }}>{success}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-control"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                placeholder="Inserisci il tuo username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="Inserisci la tua email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={40}
                autoComplete="new-password"
                placeholder="Inserisci la tua password"
              />
              <div className="password-requirements">
                <small className="text-muted">La password deve contenere:</small>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: '4px 0 0',
                  fontSize: '13px' 
                }}>
                  <li className={formData.password.length >= 8 ? 'valid' : ''} style={{ color: formData.password.length >= 8 ? 'var(--success)' : 'var(--gray-400)' }}>
                    ✓ Almeno 8 caratteri
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''} style={{ color: /[A-Z]/.test(formData.password) ? 'var(--success)' : 'var(--gray-400)' }}>
                    ✓ 1 lettera maiuscola
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'valid' : ''} style={{ color: /[a-z]/.test(formData.password) ? 'var(--success)' : 'var(--gray-400)' }}>
                    ✓ 1 lettera minuscola
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'valid' : ''} style={{ color: /[0-9]/.test(formData.password) ? 'var(--success)' : 'var(--gray-400)' }}>
                    ✓ 1 numero
                  </li>
                  <li className={/[@#$%^&+=!]/.test(formData.password) ? 'valid' : ''} style={{ color: /[@#$%^&+=!]/.test(formData.password) ? 'var(--success)' : 'var(--gray-400)' }}>
                    ✓ 1 carattere speciale (@#$%^&+=!)
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Conferma Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'is-invalid' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={40}
                autoComplete="new-password"
                placeholder="Conferma la tua password"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="form-error">Le password non corrispondono</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 'var(--space-4)' }}>
            Hai già un account? <Link to="/login">Accedi</Link>
          </p>
        </div>
      </div>
      
      {showProprietarioModal && (
        <ProprietarioRegistrationModal
          onClose={() => setShowProprietarioModal(false)}
          onSuccess={handleProprietarioSuccess}
          onSkip={handleProprietarioSkip}
        />
      )}
    </div>
  );
}

export default Signup;
