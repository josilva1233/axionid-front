import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Memoizamos a verificação social para evitar re-renderizações infinitas
  const socialData = useMemo(() => ({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    isSocial: !!searchParams.get('token')
  }), [searchParams]);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 2. O estado inicial já nasce com os dados da URL se existirem
  const [formData, setFormData] = useState({
    name: socialData.name,
    email: socialData.email,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 3. Efeito para configurar o Token e garantir que os campos preencham
  useEffect(() => {
    if (socialData.isSocial) {
      console.log("Login via Google detectado. Travando campos de identificação.");
      
      // Forçamos o preenchimento caso o estado inicial tenha falhado por delay da URL
      setFormData(prev => ({
        ...prev,
        name: socialData.name,
        email: socialData.email
      }));

      localStorage.setItem('@AxionID:token', socialData.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${socialData.token}`;
    }
  }, [socialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (socialData.isSocial) {
        // UPDATE para usuários vindos do Google
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
        alert('Cadastro via Google finalizado!');
      } else {
        // CREATE para registro manual
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
        alert('Cadastro manual realizado com sucesso!');
      }

      navigate('/dashboard', { replace: true });
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
          
          {/* STEP 1: NOME E EMAIL */}
          {step === 1 && (
            <div className="step-content animate-in">
              <h3>{socialData.isSocial ? 'Verifique seus dados' : 'Crie sua conta'}</h3>
              
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  readOnly={socialData.isSocial} // Bloqueia edição se for Google
                  className={socialData.isSocial ? 'input-blocked' : ''}
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
                  readOnly={socialData.isSocial} // Bloqueia edição se for Google
                  className={socialData.isSocial ? 'input-blocked' : ''}
                  required 
                />
              </div>

              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                {socialData.isSocial ? 'Confirmar e Continuar' : 'Próximo Passo'}
              </button>
            </div>
          )}

          {/* STEP 2: CPF/CNPJ */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Identificação</h3>
              <p>Olá {formData.name.split(' ')[0]}, informe seu documento:</p>
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
                {!socialData.isSocial && (
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

      {/* Adicione este estilo simples ao seu arquivo CSS para feedback visual */}
      <style>{`
        .input-blocked {
          background-color: #1a1a1a !important;
          color: #888 !important;
          cursor: not-allowed;
          border: 1px solid #333 !important;
        }
      `}</style>
    </div>
  );
}