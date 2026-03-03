import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      const needsCpf = params.get('needs_cpf');
      const isAdmin = params.get('is_admin');
      const userName = params.get('name');
      const userEmail = params.get('email');

      // 1. SALVAR DADOS IMEDIATAMENTE
      localStorage.setItem('@AxionID:token', token);
      localStorage.setItem('@AxionID:role', isAdmin === '1' ? 'admin' : 'user');
      localStorage.setItem('user_data', JSON.stringify({
        name: userName,
        email: userEmail,
        is_admin: isAdmin === '1'
      }));

      // 2. LIMPAR A URL PARA EVITAR LOOP (O "PISCA")
      window.history.replaceState({}, document.title, "/");

      // 3. LOGICA DE REDIRECIONAMENTO DOS CENÁRIOS
      if (needsCpf === 'true') {
        // Cenário 2: Falta CPF
        navigate('/register', { replace: true });
      } else {
        // Cenário 1 e 3: Tudo ok, vai pro Dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/v1/login', { username, password });
      localStorage.setItem('@AxionID:token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
      const isAdmin = response.data.user.is_admin === 1 || response.data.user.is_admin === true;
      localStorage.setItem('@AxionID:role', isAdmin ? 'admin' : 'user');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        <form onSubmit={handleLogin} className="auth-form">
          <input type="text" placeholder="CPF ou CNPJ" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
          <div className="divider"><span>ou</span></div>
          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" /> 
            Google Workspace
          </button>
        </form>
      </div>
    </div>
  );
}