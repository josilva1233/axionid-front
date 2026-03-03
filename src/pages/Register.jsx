import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Captura inicial dos dados da URL
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isSocialRegistration = !!tokenFromUrl;

  const [loading, setLoading] = useState(false);
  // Se for Google, mantemos no step 1 para ele confirmar os dados antes do CPF
  const [step, setStep] = useState(1);

  // Estado inicial
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 2. Efeito para Sincronização e Configuração de Token
  useEffect(() => {
    if (isSocialRegistration) {
      console.log("Login via Google detectado. Configurando ambiente...");
      
      // Garante que o estado tenha os dados da URL
      setFormData(prev => ({
        ...prev,
        name: nameFromUrl,
        email: emailFromUrl
      }));

      // Salva o token para o interceptor do api.js funcionar
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocialRegistration, nameFromUrl, emailFromUrl, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 3. Finalização do Cadastro (Create ou Update)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('@AxionID:token');

    try {
      if (isSocialRegistration || token) {
        // Fluxo Google: O usuário já existe, vamos apenas completar (Update)
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
        alert('Cadastro via Google finalizado!');
      } else {
        // Fluxo Manual: Criação do zero (Post)
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        alert('Cadastro realizado com sucesso!');
      }

      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error("Erro no registro:", error.response?.data);
      if (error.response?.status === 422) {
        const messages = error.response.data.errors;
        alert("Erro de validação: " + Object.values(messages).flat().join(", "));
      } else {
        alert(error.response?.data?.message || "Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: DADOS BÁSICOS (Bloqueados se for Google) */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? 'Confirme seus dados' : 'Crie sua conta'}</h3>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  readOnly={isSocialRegistration}
                  className={isSocialRegistration ? 'input-readonly' : ''}
                  placeholder="Seu nome"
                  required 
                />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  readOnly={isSocialRegistration}
                  className={isSocialRegistration ? 'input-readonly' : ''}
                  placeholder="seu@email.com"
                  required 
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleNextStep}>
                {isSocialRegistration ? 'Dados corretos, prosseguir' : 'Próximo Passo'}
              </button>
            </div>
          )}

          {/* STEP 2: CPF/CNPJ */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? `Olá, ${formData.name.split(' ')[0]}` : 'Identificação'}</h3>
              <p>Precisamos do seu documento para continuar.</p>
              
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
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>
                <button type="button" className="btn-primary" onClick={handleNextStep} disabled={!formData.cpf_cnpj}>
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SENHA */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Defina sua senha</h3>
              <p>Último passo para acessar o AxionID.</p>
              <div className="input-group">
                <label>Senha</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Confirmar Senha</label>
                <input name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required />
              </div>
              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>
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