import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/api/v1/login', { username, password });
      localStorage.setItem('@AxionID:token', data.token);
      localStorage.setItem('@AxionID:role', data.user.is_admin ? 'admin' : 'user');
      navigate('/dashboard');
    } catch { alert("Erro no login"); }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Login AxionID</h2>
        <input placeholder="Usuário" onChange={e => setUsername(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        <button className="btn-primary">Entrar</button>
      </form>
    </div>
  );
}