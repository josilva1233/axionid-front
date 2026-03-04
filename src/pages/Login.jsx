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
      localStorage.setItem('@AxionID:token', token);
      // Se precisar de CPF, o Dashboard pode mostrar um Modal
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ATENÇÃO: Se o backend não tiver HTTPS, este POST falhará na Vercel (Mixed Content)
      const response = await api.post('/api/v1/login', { username, password });
      localStorage.setItem('@AxionID:token', response.data.token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert("Erro de segurança: O navegador bloqueou a conexão insegura com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin; // https://axionid-front.vercel.app
    // Redirecionamento direto via janela evita o bloqueio de AJAX do Mixed Content
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    // ... seu JSX anterior ...
    <button type="button" className="btn-google" onClick={handleGoogleLogin}>
      Google Workspace
    </button>
  );
}