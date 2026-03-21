import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

export default function Register() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name') || '';
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const isSocial = !!tokenFromUrl;

  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (isSocial) {
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError("As senhas não conferem.");
    }
    
    setLoading(true);
    setError('');

    try {
      if (isSocial) {
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          from_google: isSocial
        });
      } else {
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao finalizar cadastro. Verifique os dados.");
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

        <form onSubmit={handleRegister} className="auth-form">

          {step === 1 && !isSocial && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Crie sua conta</h2>
                <p>Comece informando seus dados básicos para acesso.</p>
              </div>

              <div className="input-group">
                <label>Nome Completo</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>E-mail Corporativo</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                Próximo Passo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Olá, {formData.name ? formData.name.split(' ')[0] : 'Bem-vindo'}!</h2>
                <p>Para sua segurança, informe seu CPF ou CNPJ para validarmos sua ID.</p>
              </div>

              <div className="input-group">
                <label>Documento (CPF ou CNPJ)</label>
                <input
                  name="cpf_cnpj"
                  placeholder="Apenas números"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  autoFocus
                  required
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                {!isSocial && (
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    Voltar
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ flex: 2 }}
                  onClick={() => setStep(3)}
                  disabled={!formData.cpf_cnpj}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Segurança</h2>
                <p>Crie uma senha forte para proteger seu acesso.</p>
              </div>

              <div className="input-group">
                <label>Senha de Acesso</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoFocus
                  required
                />
              </div>

              <div className="input-group">
                <label>Confirmar Senha</label>
                <input
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                  Voltar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Finalizando...' : 'Concluir Registro'}
                </button>
              </div>
            </div>
          )}

        </form>

        <div className="auth-footer">
          <p>Já possui uma conta? <Link to="/login">Fazer Login</Link></p>
        </div>
      </div>
    </div>
  );
}