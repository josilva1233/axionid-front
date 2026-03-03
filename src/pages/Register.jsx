import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();

  // =============================
  // 1️⃣ Extração dos parâmetros da URL
  // =============================
  const params = new URLSearchParams(window.location.search);

  const nameFromUrl = params.get('name') || '';
  const emailFromUrl = params.get('email') || '';
  const tokenFromUrl = params.get('token') || '';
  const firstLoginFromUrl = params.get('firstLogin');

  const isSocial = !!tokenFromUrl;

  // 🔎 DEBUG
  console.log({
    nameFromUrl,
    emailFromUrl,
    tokenFromUrl,
    firstLoginFromUrl
  });

  // =============================
  // 2️⃣ Controle de Step
  // =============================
  const [step, setStep] = useState(isSocial ? 2 : 1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: nameFromUrl,
    email: emailFromUrl,
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
  });

  // =============================
  // 3️⃣ Configuração inicial
  // =============================
  useEffect(() => {
    if (isSocial) {
      console.log("Login via Google detectado.");

      localStorage.setItem('@AxionID:token', tokenFromUrl);
      api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromUrl}`;
    }
  }, [isSocial, tokenFromUrl]);

  // =============================
  // 4️⃣ Handlers
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSocial) {
        await api.post('/api/v1/complete-profile', {
          cpf_cnpj: formData.cpf_cnpj,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });
      } else {
        const response = await api.post('/api/v1/register', formData);
        localStorage.setItem('@AxionID:token', response.data.token);
      }

      navigate('/dashboard', { replace: true });

    } catch (error) {
      alert(error.response?.data?.message || "Erro ao finalizar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 5️⃣ Render
  // =============================
  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <form onSubmit={handleRegister} className="auth-form">

          {/* STEP 1 */}
          {step === 1 && !isSocial && (
            <div className="step-content animate-in">
              <h3>Crie sua conta</h3>

              <div className="input-group">
                <label>Nome Completo</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
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
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep(2)}
              >
                Próximo Passo
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
                Olá, {formData.name ? formData.name.split(' ')[0] : 'Seja bem-vindo'}!
              </h3>

              <p style={{ textAlign: 'center', marginBottom: '20px' }}>
                Precisamos do seu CPF ou CNPJ para continuar.
              </p>

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
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    Voltar
                  </button>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!formData.cpf_cnpj}
                >
                  Avançar
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="step-content animate-in">
              <h3>Segurança</h3>
              <p>Defina sua senha de acesso.</p>

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
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
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
