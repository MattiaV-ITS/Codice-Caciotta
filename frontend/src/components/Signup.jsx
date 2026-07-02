import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/authService';
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
  
  const navigate = useNavigate();

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

    // Client-side validation
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
      await AuthService.signup(
        formData.username,
        formData.email,
        formData.password,
        ['user']
      );
      setSuccess('Registrazione completata! Ora puoi effettuare il login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registrati</h2>
        <p className="auth-subtitle">Crea il tuo account per accedere al sistema.</p>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="Inserisci la tua email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={40}
              autoComplete="new-password"
              placeholder="Inserisci la tua password"
            />
            <div className="password-requirements">
              <small>La password deve contenere:</small>
              <ul>
                <li className={formData.password.length >= 8 ? 'valid' : ''}>Almeno 8 caratteri</li>
                <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>1 lettera maiuscola</li>
                <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>1 lettera minuscola</li>
                <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>1 numero</li>
                <li className={/[@#$%^&+=!]/.test(formData.password) ? 'valid' : ''}>1 carattere speciale (@#$%^&+=!)</li>
              </ul>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={40}
              autoComplete="new-password"
              placeholder="Conferma la tua password"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span className="password-mismatch">Le password non corrispondono</span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <p className="auth-footer">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
