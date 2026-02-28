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
    const needsCpf = params.get('needs_cpf');
    const isAdmin = params.get('is_admin');

    if (token) {
      // SALVAMOS O TOKEN SEMPRE (para ele ter acesso ao Dashboard)
      localStorage.setItem('@AxionID:token', token);
      localStorage.setItem('@AxionID:role', isAdmin === '1' ? 'admin' : 'user');

      // Se o usuário veio do Google mas não tem CPF:
      if (needsCpf === 'true') {
         // Opcional: Você pode mandar direto para o CompleteProfile 
         // OU apenas mandar para o Dashboard e deixar o Alerta Lateral aparecer.
         navigate('/dashboard', { replace: true });
      } else {
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
      
      const isAdmin = response.data.user.is_admin === 1 || response.data.user.is_admin === true;
      localStorage.setItem('@AxionID:role', isAdmin ? 'admin' : 'user');

      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Tratar erro aqui
    } finally {
      setLoading(false);
    }
  };

  // Função para chamar o Google com a ORIGIN dinâmica
  const handleGoogleLogin = () => {
    const origin = window.location.origin; // Detecta se é localhost ou vercel
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Autenticando...' : 'Acessar Painel'}
          </button>
          
          <div className="divider"><span>ou continue com</span></div>
          
          <button 
            type="button" 
            className="btn-google" 
            onClick={handleGoogleLogin} // Chamada dinâmica corrigida
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