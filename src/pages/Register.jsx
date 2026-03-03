import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  
  const isSocial = !!params.get('token');
  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: params.get('name') || '',
    email: params.get('email') || '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    if (isSocial) {
      const token = params.get('token');
      localStorage.setItem('@AxionID:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [isSocial]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const route = isSocial ? '/api/v1/complete-profile' : '/api/v1/register';
      await api.post(route, formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Erro no cadastro");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <form onSubmit={handleRegister} className="auth-form">
          {step === 1 && !isSocial && (
            <div className="step-content">
              <h3>Crie sua conta</h3>
              <input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nome" />
              <button type="button" onClick={() => setStep(2)}>Próximo</button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Olá, {formData.name.split(' ')[0]}!</h3>
              <p>Informe seu CPF ou CNPJ para continuar.</p>
              <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} placeholder="CPF/CNPJ" autoFocus />
              <button type="button" onClick={() => setStep(3)}>Avançar</button>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Defina sua Senha</h3>
              <input type="password" placeholder="Senha" onChange={e => setFormData({...formData, password: e.target.value})} />
              <input type="password" placeholder="Confirmar" onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
              <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Concluir'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}