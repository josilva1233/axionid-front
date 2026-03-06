import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Lógica para capturar token via URL (Google OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('@AxionID:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      api.get('/api/v1/me')
        .then(res => {
          const user = res.data;
          const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';
          localStorage.setItem('@AxionID:role', role);
          window.history.replaceState({}, document.title, "/login");
          navigate('/dashboard', { replace: true });
        })
        .catch(() => navigate('/login', { replace: true }));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/v1/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('@AxionID:token', token);
      const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';
      localStorage.setItem('@AxionID:role', role);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Plataforma de Identidade Segura
        </p>

        {error && <div className="error-message" style={{ color: 'var(--error)', marginBottom: '15px', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Identificação</label>
            <input 
              type="text" 
              placeholder="CPF, CNPJ ou E-mail" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Senha</label>
              <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: var('--primary'), textDecoration: 'none' }}>
                Esqueceu?
              </Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>

          <div className="divider" style={{ textAlign: 'center', margin: '15px 0', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            <span>ou continue com</span>
          </div>
          
          <button 
            type="button" 
            className="google-btn" 
            onClick={handleGoogleLogin}
            style={{ width: '100%' }}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Logo.svg" width="18" alt="Google" /> 
            Google Workspace
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>Ainda não tem acesso? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Criar Conta</Link></p>
        </div>
      </div>
    </div>
  );
}