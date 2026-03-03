import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  // 1. Iniciamos os estados vazios para evitar inconsistências
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 2. Este efeito roda IMEDIATAMENTE após o carregamento para definir o fluxo
  useEffect(() => {
    const nameUrl = searchParams.get('name');
    const emailUrl = searchParams.get('email');
    const tokenUrl = searchParams.get('token');

    if (tokenUrl) {
      console.log("Login via Google detectado. Nome:", nameUrl);
      
      // Preenche os dados e pula direto para o STEP 2 (Boas-vindas/CPF)
      setFormData(prev => ({
        ...prev,
        name: nameUrl || '',
        email: emailUrl || ''
      }));
      
      setStep(2); // Pula a tela de "Crie sua conta"

      // Configura o Token
      localStorage.setItem('@AxionID:token', tokenUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenUrl}`;
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isSocial = !!searchParams.get('token');

    try {
      if (isSocial) {
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
      } else {
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: DADOS BÁSICOS (Apenas registro manual) */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>Crie sua conta</h3>
              <div className="input-group">
                <label>Nome Completo</label>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                Próximo Passo
              </button>
            </div>
          )}

          {/* STEP 2: TELA "OLÁ, JULIANE!" (Ponto de entrada do Google) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Olá, {formData.name ? formData.name.split(' ')[0] : 'Seja bem-vindo'}!</h3>
              <p>Precisamos do seu CPF ou CNPJ para continuar.</p>
              
              <div className="input-group">
                <label>CPF ou CNPJ</label>
                <input 
                  name="cpf_cnpj" 
                  placeholder="Apenas números" 
                  value={formData.cpf_cnpj} 
                  onChange={handleChange} 
                  autoFocus 
                  required 
                />
              </div>
              
              <div className="btn-group">
                {!searchParams.get('token') && (
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                )}
                <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!formData.cpf_cnpj}>
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SEGURANÇA */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Defina sua senha de acesso.</p>
              <div className="input-group">
                <label>Senha</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Confirmar Senha</label>
                <input name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required />
              </div>
              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Voltar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Finalizando...' : 'Concluir Registro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}