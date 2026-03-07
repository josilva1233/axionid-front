import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', token: '', password: '', password_confirmation: '' });

  const handleRequest = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/api/v1/forgot-password', { email: formData.email }); setStep(2); } 
    catch { alert("E-mail não encontrado."); } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/api/v1/verify-code', { email: formData.email, token: formData.token }); setStep(3); } 
    catch { alert("Código inválido."); } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/api/v1/reset-password', formData); alert("Senha alterada!"); navigate('/login'); } 
    catch { alert("Erro ao resetar."); } finally { setLoading(false); }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        <div className="stepper-bar">
          {[1,2,3].map(i => <div key={i} className={`step-indicator ${step >= i ? 'active' : ''}`} />)}
        </div>

        {step === 1 && (
          <form onSubmit={handleRequest}>
            <div className="auth-header-text"><h2>Recuperar Senha</h2><p>Insira seu e-mail cadastrado.</p></div>
            <div className="input-group"><input type="email" placeholder="seu@email.com" required onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <button className="btn-primary">{loading ? 'Enviando...' : 'Enviar Código'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <div className="auth-header-text"><h2>Verificar Código</h2><p>Enviamos um código para seu e-mail.</p></div>
            <div className="input-group"><input type="text" className="input-token" maxLength="6" required onChange={e => setFormData({...formData, token: e.target.value})} /></div>
            <button className="btn-primary">Verificar</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset}>
            <div className="auth-header-text"><h2>Nova Senha</h2><p>Crie sua nova combinação.</p></div>
            <div className="input-group"><input type="password" placeholder="Nova Senha" required onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            <div className="input-group"><input type="password" placeholder="Repita a Senha" required onChange={e => setFormData({...formData, password_confirmation: e.target.value})} /></div>
            <button className="btn-primary">Alterar Senha</button>
          </form>
        )}
        <Link to="/login" className="link-back">Voltar ao Login</Link>
      </div>
    </div>
  );
}