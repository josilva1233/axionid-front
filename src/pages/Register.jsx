import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. CAPTURA INICIAL DOS DADOS DA URL (Fallback imediato)
  const tempKey = searchParams.get('t') || ''; 
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const googleIdFromUrl = searchParams.get('google_id') || ''; 
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 2. ESTADO DO FORMULÁRIO (Inicia com o que houver na URL)
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    google_id: googleIdFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

useEffect(() => {
  if (tempKey) {
    // Busca os dados sensíveis (google_id) que estão escondidos no servidor
    api.get(`/api/v1/auth/temp-data/${tempKey}`)
      .then(res => {
        console.log("DADOS RECUPERADOS COM SEGURANÇA:", res.data);
        
        setFormData(prev => ({
          ...prev,
          name: res.data.name || prev.name,
          email: res.data.email || prev.email,
          google_id: res.data.google_id // O ID entra aqui vindo do servidor, não da URL
        }));
      })
      .catch(err => {
        console.error("Erro: A chave expirou ou é inválida.");
        // Opcional: alert("Sessão expirada. Tente o login novamente.");
      });
  }
}, [tempKey]);

  // 4. ATUALIZAÇÃO DE ESTADO SEGURA
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 5. FINALIZAÇÃO DO CADASTRO (Onde o 422 acontecia)
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Verificação de segurança no console
    console.log("PAYLOAD FINAL PARA ENVIO:", formData);

    if (isSocialRegistration && !formData.google_id) {
        alert("Erro: ID do Google não detectado. Tente refazer o login.");
        return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/v1/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem('@AxionID:email', response.data.user.email);
      }

      alert('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error("ERRO NO REGISTRO:", error.response?.data);
      const errorMsg = error.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
      alert(errorMsg);
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
          
          {/* STEP 1: DADOS BÁSICOS */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? 'Confirme seus dados' : 'Crie sua conta'}</h3>
              <p>Passo 1 de 3: Informações básicas</p>
              
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  readOnly={isSocialRegistration && formData.name !== ''}
                  className={isSocialRegistration ? "input-readonly" : "input-standard"} 
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
                  readOnly={isSocialRegistration && formData.email !== ''}
                  className={isSocialRegistration ? "input-readonly" : "input-standard"} 
                  required 
                />
              </div>

              <button type="button" className="btn-primary" onClick={handleNextStep}>
                Próximo Passo
              </button>
            </div>
          )}

          {/* STEP 2: IDENTIFICAÇÃO */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Identificação</h3>
              <p>Passo 2 de 3: Documento obrigatório</p>
              
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

          {/* STEP 3: SEGURANÇA E SUBMIT */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Passo 3 de 3: Defina sua senha</p>
              
              {/* INPUTS HIDDEN: Garantem que esses valores sejam enviados no POST final */}
              <input type="hidden" name="name" value={formData.name} />
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="google_id" value={formData.google_id} />

              <div className="input-group">
                <label>Senha</label>
                <input 
                  name="password" 
                  type="password" 
                  value={formData.password}
                  onChange={handleChange} 
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
                  required 
                />
              </div>

              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Processando...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}