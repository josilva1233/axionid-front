import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. CAPTURA DOS PARÂMETROS DA URL
  const tempKey = searchParams.get('t') || ''; 
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 2. ESTADO INICIAL DO FORMULÁRIO
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    google_id: '', // Será preenchido pelo useEffect
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  // 3. BUSCA DADOS SEGUROS NO CACHE DO BACKEND
  useEffect(() => {
    // Se existir a chave 't', buscamos o google_id no servidor para garantir integridade
    if (tempKey) {
      api.get(`/api/v1/auth/temp-data/${tempKey}`)
        .then(res => {
          console.log("Dados recuperados do cache com sucesso:", res.data);
          setFormData(prev => ({
            ...prev,
            name: res.data.name || prev.name,
            email: res.data.email || prev.email,
            google_id: res.data.google_id || prev.google_id
          }));
        })
        .catch(err => {
          console.error("Erro ao recuperar dados temporários do servidor:", err);
          // Opcional: Redirecionar para login se o cache expirar
        });
    }
  }, [tempKey]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  // 4. FINALIZAÇÃO DO CADASTRO
  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Verificação de segurança no console antes de disparar a API
    console.log("Enviando payload final para o AxionID:", formData);

    setLoading(true);
    try {
      const response = await api.post('/api/v1/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        localStorage.setItem('@AxionID:email', response.data.user.email);
      }

      alert('Cadastro finalizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Erro no registro:", error.response?.data);
      // Exibe erros de validação do Laravel (como CPF já existente)
      const errorMsg = error.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.';
      alert(errorMsg);
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
          
          {/* ETAPA 1: Dados Básicos (Confirmar dados do Google) */}
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
                  readOnly={isSocialRegistration} // Impede edição se vier do Google
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
                  readOnly={isSocialRegistration} 
                  className={isSocialRegistration ? "input-readonly" : "input-standard"} 
                  required 
                />
              </div>

              <button type="button" className="btn-primary" onClick={handleNextStep}>
                Próximo Passo
              </button>
            </div>
          )}

          {/* ETAPA 2: Documentação */}
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

          {/* ETAPA 3: Senha e Envio */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Passo 3 de 3: Defina sua senha</p>
              
              <div className="input-group">
                <label>Senha</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Mínimo 8 caracteres" 
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
                  placeholder="Repita a senha" 
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