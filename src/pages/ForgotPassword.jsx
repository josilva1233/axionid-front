import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nova Senha
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ETAPA 1: Solicitar Código
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/forgot-password', { email: formData.email });
      alert("Código enviado para seu e-mail!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao solicitar código.");
    } finally {
      setLoading(false);
    }
  };

  // ETAPA 2: Validar Código
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/verify-code', { 
        email: formData.email, 
        token: formData.token 
      });
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  // ETAPA 3: Resetar Senha
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/reset-password', formData);
      alert("Senha alterada com sucesso! Faça login agora.");
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="auth-form">
            <h3>Recuperar Senha</h3>
            <p>Digite seu e-mail para receber o código de 6 dígitos.</p>
            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" name="email" required 
                value={formData.email} onChange={handleChange}
                placeholder="seu@email.com"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
            <Link to="/login" className="back-link">Voltar para o Login</Link>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="auth-form">
            <h3>Verificar Código</h3>
            <p>Enviamos um código alfanumérico para <strong>{formData.email}</strong></p>
            <div className="input-group">
              <label>Código de 6 dígitos</label>
              <input 
                type="text" name="token" required 
                value={formData.token} onChange={handleChange}
                placeholder="Ex: ABC123"
                maxLength="6"
                style={{ textTransform: 'uppercase', textAlign: 'center', fontSize: '1.5rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Validando...' : 'Confirmar Código'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">Mudar E-mail</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <h3>Nova Senha</h3>
            <p>Crie uma senha segura de pelo menos 8 caracteres.</p>
            <div className="input-group">
              <label>Nova Senha</label>
              <input 
                type="password" name="password" required 
                value={formData.password} onChange={handleChange}
                placeholder="********"
              />
            </div>
            <div className="input-group">
              <label>Confirmar Nova Senha</label>
              <input 
                type="password" name="password_confirmation" required 
                value={formData.password_confirmation} onChange={handleChange}
                placeholder="********"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Alterar Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}