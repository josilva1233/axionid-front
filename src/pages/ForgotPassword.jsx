import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/forgot-password', { email: formData.email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "E-mail não encontrado em nossa base.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/verify-code', { 
        email: formData.email, 
        token: formData.token 
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError("As senhas não conferem.");
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/v1/reset-password', formData);
      alert("Senha redefinida com sucesso!");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>

        <div className="stepper-container">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`step-indicator ${step >= i ? 'active' : 'inactive'}`}
              style={{ width: '33%' }}
            />
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="step-content">
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="auth-form">
              <div className="auth-header">
                <h2>Recuperar Senha</h2>
                <p>Informe seu e-mail para receber um código de validação.</p>
              </div>

              <div className="input-group">
                <label>E-mail Cadastrado</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  autoFocus
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="seu@email.com"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Código de Verificação'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <Link to="/login" className="forgot-link">
                  ← Voltar para o Login
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="auth-header">
                <h2>Verificar Código</h2>
                <p>Enviamos um código para <strong>{formData.email}</strong></p>
              </div>

              <div className="input-group">
                <label>Código de 6 dígitos</label>
                <input 
                  type="text" 
                  name="token" 
                  required 
                  autoFocus
                  value={formData.token} 
                  onChange={handleChange}
                  placeholder="------"
                  maxLength="6"
                  className="code-input"
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Validando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="auth-header">
                <h2>Nova Senha</h2>
                <p>Crie uma combinação segura para o seu novo acesso.</p>
              </div>

              <div className="input-group">
                <label>Nova Senha</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  autoFocus
                  value={formData.password} 
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="input-group">
                <label>Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  name="password_confirmation" 
                  required 
                  value={formData.password_confirmation} 
                  onChange={handleChange}
                  placeholder="Repita a nova senha"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Atualizar e Acessar'}
              </button>
            </form>
          )}
        </div>

        <div className="auth-footer">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Não recebeu o e-mail? Verifique sua caixa de spam ou tente novamente em instantes.
          </p>
        </div>
      </div>
    </div>
  );
}