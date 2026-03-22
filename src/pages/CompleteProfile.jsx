import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../Login.css';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    cpf_cnpj: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    password: '',
    password_confirmation: ''
  });

  const handleZipCodeBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            zip_code: cep
          }));
          setErrors(prev => ({ ...prev, zip_code: null }));
        } else {
          alert("CEP não encontrado.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return alert("As senhas não coincidem.");
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/api/v1/complete-profile', formData);
      alert("Cadastro finalizado com sucesso!");
      
      const role = response.data.user?.is_admin === 1 || response.data.user?.is_admin === true ? "admin" : "user";
      localStorage.setItem('@AxionID:role', role);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || error.response.data);
      } else {
        alert("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        
        <div className="stepper-container">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`step-indicator ${step >= i ? 'active' : 'inactive'}`}
              style={{ width: '33%' }}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {step === 1 && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Identificação</h2>
                <p>Precisamos validar seu documento para ativar sua ID.</p>
              </div>

              <div className="input-group">
                <label>CPF ou CNPJ</label>
                <input 
                  name="cpf_cnpj" 
                  placeholder="Apenas números" 
                  value={formData.cpf_cnpj}
                  onChange={handleChange} 
                  required 
                  autoFocus
                />
                {errors.cpf_cnpj && <span className="error-message" style={{ marginTop: '5px', marginBottom: '0', padding: '8px', fontSize: '0.75rem' }}>{errors.cpf_cnpj[0]}</span>}
              </div>

              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setStep(2)} 
                disabled={!formData.cpf_cnpj}
              >
                Próximo: Endereço
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Onde você reside?</h2>
                <p>Esses dados são usados para faturamento e segurança.</p>
              </div>
              
              <div className="input-group">
                <label>CEP</label>
                <input 
                  name="zip_code" 
                  placeholder="00000-000" 
                  value={formData.zip_code}
                  onBlur={handleZipCodeBlur} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="row-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 3 }}>
                  <label>Rua</label>
                  <input name="street" value={formData.street} onChange={handleChange} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Nº</label>
                  <input name="number" placeholder="123" value={formData.number} onChange={handleChange} required />
                </div>
              </div>

              <div className="row-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 2 }}>
                  <label>Bairro</label>
                  <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} required />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>UF</label>
                  <input name="state" value={formData.state} onChange={handleChange} required maxLength="2" />
                </div>
              </div>

              <div className="input-group">
                <label>Cidade</label>
                <input name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>Voltar</button>
                <button type="button" className="btn-primary" style={{ flex: 2 }} onClick={() => setStep(3)}>Próximo: Segurança</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <div className="auth-header">
                <h2>Segurança</h2>
                <p>Finalize criando sua senha de acesso.</p>
              </div>

              <div className="input-group">
                <label>Nova Senha</label>
                <input 
                  type="password" name="password" 
                  placeholder="Mínimo 6 caracteres" 
                  onChange={handleChange} required 
                />
                {errors.password && <span className="error-message" style={{ marginTop: '5px', marginBottom: '0', padding: '8px', fontSize: '0.75rem' }}>{errors.password[0]}</span>}
              </div>

              <div className="input-group">
                <label>Confirmar Senha</label>
                <input 
                  type="password" name="password_confirmation" 
                  placeholder="Repita a senha" 
                  onChange={handleChange} required 
                />
              </div>

              <div className="btn-group" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>Voltar</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
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