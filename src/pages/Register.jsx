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
  // Se existe token na URL, consideramos que é registro via Google
  const isSocialRegistration = !!tokenFromUrl;

  const [loading, setLoading] = useState(false);
  // Se vier do google, começa no Step 2 (CPF), senão começa no Step 1
  const [step, setStep] = useState(isSocialRegistration ? 2 : 1);

  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 2. Persistência do Token e configuração da API
  useEffect(() => {
    if (tokenFromUrl) {
      // Usamos a chave padrão que definimos no seu api.js e Login.js
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      
      // Atualiza o header da instância do axios imediatamente
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      
      console.log("Token do Google configurado para finalização de perfil.");
    }
  }, [tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 3. Finalização do Cadastro (Lógica Unificada)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocialRegistration) {
        // CENÁRIO GOOGLE: O usuário já foi criado no banco pelo callback, 
        // agora usamos o UPDATE via complete-profile
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
        alert('Cadastro via Google finalizado!');
      } else {
        // CENÁRIO MANUAL: Usuário não existe no banco, criamos do zero
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        alert('Cadastro manual realizado com sucesso!');
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Erro no registro:", error.response?.data);
      
      if (error.response?.status === 422) {
        // Mostra os erros específicos (ex: CPF já cadastrado)
        const errors = error.response.data.errors;
        const firstError = errors ? Object.values(errors).flat()[0] : 'Dados inválidos';
        alert(firstError);
      } else {
        alert(error.response?.data?.message || 'Erro ao processar o cadastro.');
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
          {/* STEP 1: DADOS BÁSICOS (Cadastro Manual) */}
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
              <button type="button" className="btn-primary" onClick={handleNextStep}>Próximo Passo</button>
            </div>
          )}

          {/* STEP 2: IDENTIFICAÇÃO (Comum a todos) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? `Olá, ${formData.name.split(' ')[0]}` : 'Identificação'}</h3>
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
                {!isSocialRegistration && (
                  <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>
                )}
                <button type="button" className="btn-primary" onClick={handleNextStep} disabled={!formData.cpf_cnpj}>
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SENHA E CONCLUSÃO */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Defina sua senha de acesso ao AxionID.</p>
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