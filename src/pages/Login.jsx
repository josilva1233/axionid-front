import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState(''); // CPF ou CNPJ
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ==========================================
  // 1. Efeito para capturar o retorno do Google
  // ==========================================
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    const needsCpf = params.get('needs_cpf') === 'true';
    const isAdmin = params.get('is_admin');

    // 1. Persistência
    localStorage.setItem('@AxionID:token', token);
    
    // 2. 🔥 CRUCIAL: Configura a instância da API imediatamente
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const role = isAdmin === '1' ? 'admin' : 'user';
    localStorage.setItem('@AxionID:role', role);
    localStorage.setItem('user_data', JSON.stringify({
      name: params.get('name'),
      email: params.get('email'),
      is_admin: isAdmin === '1'
    }));

    // 3. Limpa a URL (remove o token da barra de endereços por segurança)
    window.history.replaceState({}, document.title, window.location.pathname);

    if (needsCpf) {
      navigate(`/register${window.location.search}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }
}, [navigate]);

  // ==========================================
  // 2. Handler para Login Manual (CPF/CNPJ + Senha)
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/v1/login', { 
        username, // O backend deve estar esperando 'username' ou 'cpf_cnpj'
        password 
      });

      const { token, user } = response.data;

      // Persistência
      localStorage.setItem('@AxionID:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const isAdmin = user.is_admin === 1 || user.is_admin === true;
      localStorage.setItem('@AxionID:role', isAdmin ? 'admin' : 'user');
      localStorage.setItem('user_data', JSON.stringify(user));

      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error("Erro no login manual:", error);
      alert(error.response?.data?.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. Redirecionamento para o Google
  // ==========================================
  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    // URL do seu backend Laravel
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
        <p className="subtitle">Identidade Digital Profissional</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="CPF ou CNPJ"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>

          <div className="divider">
            <span>ou continue com</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              width="20"
              alt="Google"
            />
            Google Workspace
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Ainda não tem acesso?
            <Link to="/register"> Criar Conta AxionID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}