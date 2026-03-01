import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. CAPTURE OS DADOS DA URL (Backup caso o cache falhe)
  const tempKey = searchParams.get('t') || ''; 
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const googleIdFromUrl = searchParams.get('google_id') || ''; 
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 2. INICIALIZE O FORMULÁRIO COM OS DADOS DA URL
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    google_id: googleIdFromUrl, // Começa com o que veio da URL
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  // 3. BUSCA DADOS SEGUROS NO CACHE (Se houver chave 't')
useEffect(() => {
  // Se existir a chave 't', buscamos o google_id no servidor
  if (tempKey) {
    api.get(`/api/v1/auth/temp-data/${tempKey}`)
      .then(res => {
        console.log("Dados recuperados do cache:", res.data); // Verifique isso no console!
        setFormData(prev => ({
          ...prev,
          // Aqui garantimos que o google_id seja preenchido vindo do cache do Laravel
          google_id: res.data.google_id || prev.google_id,
          name: res.data.name || prev.name,
          email: res.data.email || prev.email
        }));
      })
      .catch(err => console.error("Erro ao buscar cache no servidor:", err));
  }
}, [tempKey]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // DEBUG: Veja no console (F12) se o google_id está aqui antes de enviar
    console.log("Dados sendo enviados para o AxionID:", formData);

    setLoading(true);
    try {
      // O formData aqui JÁ contém o google_id capturado no início
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
      alert(error.response?.data?.message || 'Erro ao cadastrar. Verifique os dados.');
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
          
          {/* ETAPA 1: Dados Básicos */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? 'Bem-vindo ao AxionID' : 'Crie sua conta'}</h3>
              <p>{isSocialRegistration ? 'Confirme seus dados do Google:' : 'Informe seus dados básicos:'}</p>
              
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
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
                Confirmar e Avançar
              </button>
            </div>
          )}

          {/* ETAPA 2: CPF/CNPJ */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Identificação</h3>
              <p>Informe seu CPF ou CNPJ:</p>
              
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

          {/* ETAPA 3: Senha e Finalização */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Defina sua senha de acesso:</p>
              
              <div className="input-group">
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Senha" 
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