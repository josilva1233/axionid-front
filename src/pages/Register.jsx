import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Captura direta dos dados enviados pelo Back-end na URL
  const nameFromUrl = searchParams.get('name') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  // Se vier do google, já pula para o Step 2 (CPF)
  const [step, setStep] = useState(isSocialRegistration ? 2 : 1);

  // 2. Estado inicial preenchido com dados da URL
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  // 3. Salva o token no localStorage assim que carregar (essencial para o complete-profile)
  useEffect(() => {
    if (tokenFromUrl) {
      localStorage.setItem('axion_token', tokenFromUrl);
      // Configura o header do axios para as próximas chamadas
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  // 5. Finalização do Cadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocialRegistration) {
        // GOOGLE: Chama a rota de completar perfil (UPDATE)
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
      } else {
        // NORMAL: Cria conta do zero (POST)
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('axion_token', response.data.token);
      }

      alert('Cadastro finalizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao processar. Verifique os dados.';
      alert(errorMsg);
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
          {/* STEP 1: DADOS BÁSICOS (SÓ APARECE SE NÃO FOR GOOGLE) */}
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

          {/* STEP 2: IDENTIFICAÇÃO (PARA TODOS) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>{isSocialRegistration ? `Olá, ${formData.name}` : 'Identificação'}</h3>
              <p>Precisamos do seu CPF ou CNPJ para continuar.</p>
              <div className="input-group">
                <label>CPF ou CNPJ</label>
                <input name="cpf_cnpj" placeholder="Apenas números" value={formData.cpf_cnpj} onChange={handleChange} autoFocus required />
              </div>
              <div className="btn-group">
                {!isSocialRegistration && <button type="button" className="btn-secondary" onClick={handlePrevStep}>Voltar</button>}
                <button type="button" className="btn-primary" onClick={handleNextStep} disabled={!formData.cpf_cnpj}>Avançar</button>
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