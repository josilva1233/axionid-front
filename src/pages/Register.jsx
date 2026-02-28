import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Controle de etapas: 1 = Boas-vindas, 2 = CPF, 3 = Senha
  const [step, setStep] = useState(1);

  const isSocialRegistration = !!searchParams.get('from_google');

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/v1/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
        // Opcional: Salvar os dados do usuário para o Dashboard ler o alerta de endereço
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      alert('Cadastro finalizado!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        
        {/* Barra de Progresso Visual */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* ETAPA 1: Boas-vindas (Nome e E-mail) */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>Bem-vindo ao AxionID</h3>
              <p>Confirme seus dados de acesso vindos do Google:</p>
              
              <div className="input-group">
                <label>Nome Completo</label>
                <input name="name" value={formData.name} readOnly className="input-readonly" />
              </div>

              <div className="input-group">
                <label>E-mail</label>
                <input name="email" value={formData.email} readOnly className="input-readonly" />
              </div>

              <button type="button" className="btn-primary" onClick={handleNextStep}>
                Confirmar e Avançar
              </button>
            </div>
          )}

          {/* ETAPA 2: Documento */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Identificação</h3>
              <p>Agora, informe seu CPF ou CNPJ para continuar:</p>
              
              <div className="input-group">
                <input 
                  name="cpf_cnpj" 
                  placeholder="000.000.000-00" 
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

          {/* ETAPA 3: Segurança (Senha) */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Para finalizar, defina sua senha de acesso:</p>
              
              <div className="input-group">
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Defina uma senha" 
                  value={formData.password}
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="input-group">
                <input 
                  name="password_confirmation" 
                  type="password" 
                  placeholder="Confirme a senha" 
                  value={formData.password_confirmation}
                  onChange={handleChange} 
                  required 
                />
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