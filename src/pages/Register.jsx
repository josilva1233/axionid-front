import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', cpf_cnpj: '', password: '', password_confirmation: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/register', formData);
      alert("Conta criada! Verifique seu e-mail.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registrar.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        <div className="auth-header-text">
          <h2>Criar Conta</h2>
          <p>Junte-se à plataforma AxionID</p>
        </div>
        {error && <div className="badge danger" style={{width:'100%', marginBottom:'15px'}}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nome Completo</label>
            <input type="text" required onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label>E-mail</label>
            <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>CPF ou CNPJ</label>
            <input type="text" required onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Senha</label>
            <input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Confirmar Senha</label>
            <input type="password" required onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
          </div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Processando...' : 'Finalizar Cadastro'}</button>
        </form>
        <Link to="/login" className="link-back">Já tenho conta? Login</Link>
      </div>
    </div>
  );
}