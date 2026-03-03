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
  // Se vier do google, pula para o Step 2 (CPF)
  const [step, setStep] = useState(isSocialRegistration ? 2 : 1);

  // Estado inicial já tenta pegar o que veio da URL
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 2. Efeito para garantir preenchimento e configurar Token
  useEffect(() => {
    if (nameFromUrl || emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        name: nameFromUrl,
        email: emailFromUrl
      }));
    }
    
    if (tokenFromUrl) {
      // Salva com a chave correta que o seu api.js utiliza
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      // Configura o cabeçalho imediatamente para a próxima requisição
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [nameFromUrl, emailFromUrl, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 3. Finalização do Cadastro Corrigida
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('@AxionID:token');

    try {
      // Se detectarmos que é social ou temos token, usamos UPDATE em vez de CREATE
      if (isSocialRegistration || token) {
        console.log("Fluxo Social: Atualizando perfil existente...");
        
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });

        alert('Perfil finalizado com sucesso!');
      } else {
        // Registro manual padrão
        console.log("Fluxo Manual: Criando novo usuário...");
        
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        
        alert('Cadastro realizado com sucesso!');
      }

      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error("Erro no registro:", error.response?.data);
      
      if (error.response?.status === 422) {
        // Aqui o erro de "Email already taken" não deve mais ocorrer no fluxo Google
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
        {/* Barra de Progresso */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: NOME E EMAIL (Apenas fluxo manual) */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>Crie sua conta</h3>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
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
                  placeholder="seu@email.com"
                  required 
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleNextStep}>Próximo Passo</button>
            </div>
          )}

          {/* STEP 2: CPF/CNPJ (Início do fluxo Google) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Olá, {formData.name ? formData.name.split(' ')[0] : 'seja bem-vindo'}!</h3>
              <p>Confirme seu e-mail: <strong>{formData.email}</strong></p>
              <p>Agora, informe seu documento para continuar.</p>
              
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

          {/* STEP 3: SENHA */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Defina sua senha</h3>
              <p>Sua segurança é nossa prioridade.</p>
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