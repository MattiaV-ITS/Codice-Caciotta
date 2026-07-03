import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthService from '../services/authService';
import './Auth.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { token, user } = await AuthService.login(username, password);
      login(token, user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <div className="card-header">
          <h3>Accedi</h3>
        </div>
        <div className="card-body">
          <p className="auth-subtitle">Benvenuto! Inserisci le tue credenziali.</p>
          
          {error && <div className="form-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Inserisci il tuo username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Inserisci la tua password"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 'var(--space-4)' }}>
            Non hai un account? <Link to="/signup">Registrati</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; // ← UN SOLO EXPORT