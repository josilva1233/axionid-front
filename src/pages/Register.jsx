import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Extração IMEDIATA dos dados da URL (Síncrona)
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isSocial = !!tokenFromUrl;

  const [loading, setLoading] = useState(false);

  // 2. INICIALIZAÇÃO DO STEP: Se for social, já começa no 2.
  // Isso evita que a tela de "Crie sua conta" apareça por um milissegundo.
  const [step, setStep] = useState(isSocial ? 2 : 1);

  // 3. INICIALIZAÇÃO DO FORM: Já nasce com os dados do Google
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 4. Efeito para garantir Token e Headers (Persistência)
  useEffect(() => {
    if (isSocial) {
      console.log("Login via Google detectado. Nome:", nameFromUrl);
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl, nameFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocial) {
        // Rota de finalização para quem veio do Google
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
      } else {
        // Rota de registro comum
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: Crie sua conta (Oculto se for Google) */}
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

          {/* STEP 2: Olá, Juliane! (Ponto de entrada do Google) */}
          {step === 2 && (
            <div className="step-content animate-in">
              {/* Pegamos apenas o primeiro nome para a saudação */}
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
                {/* Oculta botão Voltar se for Google, pois não há para onde voltar */}
                {!isSocial && (
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Voltar</button>
                )}
                <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!formData.cpf_cnpj}>
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Senha */}
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
                  {loading ? 'Finalizando...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}