import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Captura inicial dos dados da URL
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isSocialRegistration = !!tokenFromUrl;

  const [loading, setLoading] = useState(false);
  // Se vier do google (isSocialRegistration), pula para o Step 2 (CPF)
  const [step, setStep] = useState(isSocialRegistration ? 2 : 1);

  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // Sincroniza o formData se os parâmetros da URL demorarem a carregar
  useEffect(() => {
    if (nameFromUrl || emailFromUrl) {
      setFormData(prev => ({
        ...prev,
        name: nameFromUrl,
        email: emailFromUrl
      }));
    }
    
    if (tokenFromUrl) {
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [nameFromUrl, emailFromUrl, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('@AxionID:token');

    try {
      // Se é registro social ou já possuímos um token, usamos UPDATE (complete-profile)
      if (isSocialRegistration || token) {
        console.log("Executando UPDATE (complete-profile)...");
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
        alert('Cadastro via Google finalizado!');
      } else {
        // Registro manual do zero
        console.log("Executando CREATE (register)...");
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        alert('Conta criada com sucesso!');
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Erro no processo:", error.response?.data);
      if (error.response && error.response.status === 422) {
        const messages = error.response.data.errors;
        alert("Erro de validação: " + Object.values(messages).flat().join(", "));
      } else {
        alert(error.response?.data?.message || "Erro ao processar cadastro.");
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
          {/* STEP 1: DADOS BÁSICOS (Sempre visível no manual, oculto no social por iniciar no step 2) */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>Crie sua conta</h3>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
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
                    required 
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleNextStep}>Próximo Passo</button>
            </div>
          )}

          {/* STEP 2: IDENTIFICAÇÃO (Aqui o usuário Google começa) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Olá, {formData.name ? formData.name.split(' ')[0] : 'usuário'}</h3>
              <p>Precisamos do seu CPF ou CNPJ para continuar.</p>
              
              {/* Campos Nome/Email ocultos mas presentes no state */}
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