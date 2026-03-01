import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tempKey = searchParams.get('t') || ''; 
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 1. ESTADO INICIAL
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    google_id: '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  // 2. BUSCA DADOS NO CACHE (Executa apenas uma vez ao montar ou se tempKey mudar)
  useEffect(() => {
    if (tempKey) {
      api.get(`/api/v1/auth/temp-data/${tempKey}`)
        .then(res => {
          console.log("DADOS CACHE RECUPERADOS:", res.data);
          // Usamos o retorno funcional para garantir que não sobrescrevemos o que o usuário já digitou
          setFormData(prev => ({
            ...prev,
            name: res.data.name || prev.name,
            email: res.data.email || prev.email,
            google_id: res.data.google_id || prev.google_id
          }));
        })
        .catch(err => console.error("Erro ao buscar cache:", err));
    }
  }, [tempKey]);

  // 3. ATUALIZAÇÃO DE ESTADO (Versão funcional para evitar perda de dados entre steps)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 4. ENVIO FINAL
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Log para conferência no console (F12)
    console.log("PAYLOAD SENDING...", formData);

    // Validação de segurança no Front
    if (!formData.name || !formData.email) {
      alert("Erro: Nome e E-mail são obrigatórios. Volte ao passo 1.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/v1/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }

      alert('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error("ERRO 422 DETALHADO:", error.response?.data);
      const msg = error.response?.data?.message || "Erro ao cadastrar. Verifique os dados.";
      alert(msg);
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
          
          {/* STEP 1: DADOS BÁSICOS */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? 'Confirme seus dados' : 'Crie sua conta'}</h3>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text"
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  readOnly={isSocialRegistration} 
                  className={isSocialRegistration ? "input-readonly" : "input-standard"} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>E-mail</label>
                <input 
                  type="email"
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  readOnly={isSocialRegistration} 
                  className={isSocialRegistration ? "input-readonly" : "input-standard"} 
                  required 
                />
              </div>
              <button type="button" className="btn-primary" onClick={handleNextStep}>
                Avançar
              </button>
            </div>
          )}

          {/* STEP 2: CPF/CNPJ */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Identificação</h3>
              <div className="input-group">
                <label>CPF ou CNPJ</label>
                <input 
                  type="text"
                  name="cpf_cnpj" 
                  placeholder="000.000.000-00"
                  value={formData.cpf_cnpj} 
                  onChange={handleChange} 
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
              <h3>Segurança</h3>
              <div className="input-group">
                <label>Senha</label>
                <input 
                  type="password"
                  name="password" 
                  value={formData.password}
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>Confirmar Senha</label>
                <input 
                  type="password"
                  name="password_confirmation" 
                  value={formData.password_confirmation}
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              {/* CAMPOS OCULTOS PARA GARANTIR O ENVIO CASO O DOM TENHA SIDO LIMPO */}
              <input type="hidden" name="name" value={formData.name} />
              <input type="hidden" name="email" value={formData.email} />
              <input type="hidden" name="google_id" value={formData.google_id} />

              <div className="btn-group">
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}