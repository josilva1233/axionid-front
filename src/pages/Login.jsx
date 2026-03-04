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
    const isAdmin = params.get('is_admin');

// Dentro do useEffect do Login.js, quando houver token:
if (token) {
    const roleValue = isAdmin === '1' ? 'admin' : 'user';
    
    localStorage.setItem('@AxionID:token', token);
    localStorage.setItem('@AxionID:role', roleValue);

    // Injeta o token no Axios na hora para a próxima página já ler
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    window.history.replaceState({}, document.title, "/login");

    setTimeout(() => {
        navigate('/dashboard', { replace: true });
    }, 300); 
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

      // Configura o token para as próximas chamadas
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Usuário ou senha incorretos.');
      console.error("Erro no login manual", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    // Garante que o redirecionamento aponte para o IP correto do backend
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
    
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        <p className="subtitle">Identidade Digital Profissional</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <input 
            type="text" 
            placeholder="CPF ou CNPJ" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
          
          <div className="divider"><span>ou continue com</span></div>
          
          <button 
            type="button" 
            className="btn-google" 
            onClick={handleGoogleLogin}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" /> 
            Google Workspace
          </button>
        </form>

        <div className="auth-footer">
          <p>Ainda não tem acesso? <Link to="/register">Criar Conta AxionID</Link></p>
        </div>
      </div>
    </div>
  );
}