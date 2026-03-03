import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Extração imediata dos dados da URL para evitar delays de renderização
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isSocial = !!tokenFromUrl;

  // 2. Estados inicializados com base na presença do Token (Google)
  const [loading, setLoading] = useState(false);
  
  // Se for Google, o 'step' já começa em 2 (Identificação/CPF)
  const [step, setStep] = useState(isSocial ? 2 : 1);

  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 3. Efeito para travar o Token no sistema assim que o componente monta
  useEffect(() => {
    if (isSocial) {
      console.log("Login via Google detectado. Nome:", nameFromUrl);
      
      // Persiste o token para as chamadas de API
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;

      // Garante que o formData tenha os dados da URL (caso o estado inicial tenha falhado)
      setFormData(prev => ({
        ...prev,
        name: nameFromUrl,
        email: emailFromUrl
      }));
    }
  }, [isSocial, nameFromUrl, emailFromUrl, tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocial) {
        // Fluxo Google: O usuário já existe, apenas completamos os dados
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
        alert('Cadastro via Google finalizado!');
      } else {
        // Fluxo Manual: Criação do zero
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        alert('Cadastro manual realizado com sucesso!');
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao processar dados.';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        {/* Barra de Progresso - Mostra 66% se for Google (já no step 2) */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* STEP 1: SÓ APARECE NO REGISTRO MANUAL */}
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
              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                Próximo Passo
              </button>
            </div>
          )}

          {/* STEP 2: IDENTIFICAÇÃO (Ponto de entrada do Google) */}
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

          {/* STEP 3: SENHA */}
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