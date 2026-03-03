import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // 1. Extração Síncrona (Direto da URL do navegador para não falhar)
  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name') || '';
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const isSocial = !!tokenFromUrl;

  const [loading, setLoading] = useState(false);

  // 2. Forçamos o Step 2 se for Social já no estado inicial
  const [step, setStep] = useState(isSocial ? 2 : 1);

  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 3. Persistência do Token e Configuração da API
  useEffect(() => {
    if (isSocial) {
      console.log("Fluxo Google Ativo: Pulando para tela de CPF.");
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
      
      // Garantia extra de que o nome está no estado
      setFormData(prev => ({
        ...prev,
        name: nameFromUrl,
        email: emailFromUrl
      }));
    }
  }, [isSocial, tokenFromUrl, nameFromUrl, emailFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocial) {
        // Rota para completar perfil do Google
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
      } else {
        // Rota de registro manual
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || "Erro no processamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: Só renderiza se NÃO for social */}
          {step === 1 && !isSocial && (
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

          {/* STEP 2: Tela de Boas-vindas (Olá, Juliane!) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Olá, {formData.name ? formData.name.split(' ')[0] : 'usuário'}!</h3>
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