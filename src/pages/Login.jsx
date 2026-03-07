import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('@AxionID:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/api/v1/me').then(res => {
        localStorage.setItem('@AxionID:role', res.data.is_admin ? 'admin' : 'user');
        navigate('/dashboard', { replace: true });
      }).catch(() => navigate('/login'));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/login', { username, password });
      localStorage.setItem('@AxionID:token', data.token);
      localStorage.setItem('@AxionID:role', data.user.is_admin ? 'admin' : 'user');
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      navigate('/dashboard');
    } catch { setError('Credenciais inválidas.'); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        {error && <p className="badge danger" style={{width:'100%', textAlign:'center', marginBottom:'15px'}}>{error}</p>}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>CPF ou CNPJ</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Acessar'}</button>
          <button type="button" onClick={() => window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${window.location.origin}`} className="btn-primary" style={{marginTop:'10px', background:'#4285F4'}}>Google Workspace</button>
        </form>
        <p style={{marginTop:'20px', textAlign:'center'}}><Link to="/register" style={{color:'var(--primary)'}}>Criar conta</Link></p>
      </div>
    </div>
  );
}