import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // 1️⃣ Extração dos parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const nameFromUrl = params.get('name') || '';
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const isSocial = !!tokenFromUrl;

  // 2️⃣ Estados (Padronizados com os outros componentes)
  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // 3️⃣ Configuração inicial (Social Login)
  useEffect(() => {
    if (isSocial) {
      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl]);

  // 4️⃣ Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError("As senhas não conferem.");
    }
    
    setLoading(true);
    setError('');

    try {
      if (isSocial) {
        // ROTA PARA QUEM VEM DO GOOGLE
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          from_google: isSocial
        });
      } else {
        // ROTA PARA CADASTRO MANUAL
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao finalizar cadastro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        {/* LOGO PADRONIZADA */}
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>

        {/* INDICADOR DE ETAPAS (STEPPER) */}
        <div className="stepper-container" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              width: '33%', 
              height: '4px', 
              borderRadius: '2px',
              background: step >= i ? 'var(--primary)' : 'var(--border-color)',
              transition: '0.3s'
            }} />
          ))}
        </div>

        {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">

          {/* STEP 1: DADOS BÁSICOS (Apenas para cadastro manual) */}
          {step === 1 && !isSocial && (
            <div className="step-content animate-in">
              <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2>Crie sua conta</h2>
                <p>Comece informando seus dados básicos para acesso.</p>
              </div>

              <div className="input-group">
                <label>Nome Completo</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>E-mail Corporativo</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button type="button" className="btn-primary" onClick={() => setStep(2)}>
                Próximo Passo
              </button>
            </div>
          )}

          {/* STEP 2: DOCUMENTAÇÃO */}
          {step === 2 && (
            <div className="step-content animate-in">
              <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2>Olá, {formData.name ? formData.name.split(' ')[0] : 'Bem-vindo'}!</h2>
                <p>Para sua segurança, informe seu CPF ou CNPJ para validarmos sua ID.</p>
              </div>

              <div className="input-group">
                <label>Documento (CPF ou CNPJ)</label>
                <input
                  name="cpf_cnpj"
                  placeholder="Apenas números"
                  value={formData.cpf_cnpj}
                  onChange={handleChange}
                  autoFocus
                  required
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                {!isSocial && (
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    Voltar
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ flex: 2 }}
                  onClick={() => setStep(3)}
                  disabled={!formData.cpf_cnpj}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SEGURANÇA */}
          {step === 3 && (
            <div className="step-content animate-in">
              <div className="auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2>Segurança</h2>
                <p>Crie uma senha forte para proteger seu acesso.</p>
              </div>

              <div className="input-group">
                <label>Senha de Acesso</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoFocus
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
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                  Voltar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Finalizando...' : 'Concluir Registro'}
                </button>
              </div>
            </div>
          )}

        </form>

        <div className="auth-footer" style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p>Já possui uma conta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Fazer Login</Link></p>
        </div>
      </div>
    </div>
  );
}