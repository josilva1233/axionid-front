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
    const step = params.get('step');
    const fromGoogle = params.get('from_google');

    if (token) {
      // 1️⃣ Salva token
      localStorage.setItem('@AxionID:token', token);

      // Remove query string da URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // 2️⃣ Se veio do Google e precisa completar cadastro
      if (fromGoogle === 'true' && step === '2') {
        navigate('/register?step=2', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/v1/login', {
        username,
        password
      });

      const { token, user } = response.data;

      localStorage.setItem('@AxionID:token', token);

      const isAdmin =
        user.is_admin === 1 || user.is_admin === true;

      localStorage.setItem('@AxionID:role', isAdmin ? 'admin' : 'user');

      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error("Erro no login manual:", error.response?.data);
      alert("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;

    // 🔥 Ideal: usar variável de ambiente
    const apiUrl = import.meta.env.VITE_API_URL;

    window.location.href =
      `${apiUrl}/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">

        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>

        <p className="subtitle">Identidade Digital Profissional</p>

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

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
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
