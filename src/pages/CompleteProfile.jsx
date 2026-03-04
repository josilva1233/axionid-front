import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Documento, 2: Endereço e Senha

  const [formData, setFormData] = useState({
    cpf_cnpj: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    password: '',              // Adicionado para o Backend
    password_confirmation: '' // Necessário para a regra 'confirmed' do Laravel
  });

  // Busca CEP automática via ViaCEP
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
    
    // Limpa o erro específico quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Envia todos os dados para a rota que você criou no AxionAuthController
      const response = await api.post('/api/v1/complete-profile', formData);
      
      alert("Cadastro finalizado com sucesso!");
      
      // Opcional: Atualizar o role no localStorage se o backend retornar is_admin
      if (response.data.user && response.data.user.is_admin) {
        localStorage.setItem('@AxionID:role', 'admin');
      }

      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || error.response.data);
        const messages = Object.values(error.response.data.errors || {}).flat().join('\n');
        alert("Erro de validação:\n" + (messages || "Verifique os campos preenchidos."));
      } else {
        alert("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card animate-in">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>

<form onSubmit={handleSubmit} className="auth-form">
  
  {/* PASSO 1: IDENTIFICAÇÃO (CPF/CNPJ) */}
  {step === 1 && (
    <div className="step-content animate-in">
      <h3>Identificação</h3>
      <p>Confirme seu documento para prosseguir.</p>
      <div className="input-group">
        <label>CPF ou CNPJ</label>
        <input 
          name="cpf_cnpj" 
          placeholder="Apenas números" 
          value={formData.cpf_cnpj}
          onChange={handleChange} 
          required 
        />
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

  {/* PASSO 2: ENDEREÇO (Sem as senhas aqui) */}
  {step === 2 && (
    <div className="step-content animate-in">
      <h3>Endereço</h3>
      <p>Onde você reside?</p>
      
      <div className="input-group">
        <label>CEP</label>
        <input name="zip_code" placeholder="00000-000" onBlur={handleZipCodeBlur} onChange={handleChange} required />
      </div>

      <div className="input-row" style={{ display: 'flex', gap: '10px' }}>
        <div className="input-group" style={{ flex: 3 }}>
          <label>Rua</label>
          <input name="street" value={formData.street} readOnly className="input-readonly" />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>Nº</label>
          <input name="number" placeholder="123" onChange={handleChange} required />
        </div>
      </div>

      <div className="input-row" style={{ display: 'flex', gap: '10px' }}>
        <div className="input-group" style={{ flex: 2 }}>
          <label>Bairro</label>
          <input name="neighborhood" value={formData.neighborhood} readOnly className="input-readonly" />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label>UF</label>
          <input name="state" value={formData.state} readOnly className="input-readonly" />
        </div>
      </div>

      <div className="btn-group">
        <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Voltar</button>
        <button type="button" className="btn-primary" onClick={() => setStep(3)}>Próximo: Segurança</button>
      </div>
    </div>
  )}

  {/* PASSO 3: SEGURANÇA (SENHAS) */}
  {step === 3 && (
    <div className="step-content animate-in">
      <h3>Segurança</h3>
      <p>Crie uma senha forte para sua conta.</p>

      <div className="input-group">
        <label>Definir Nova Senha</label>
        <input 
          type="password"
          name="password" 
          placeholder="Mínimo 6 caracteres" 
          onChange={handleChange}
          required 
        />
        {errors.password && <span className="error-msg">{errors.password[0]}</span>}
      </div>

      <div className="input-group">
        <label>Confirmar Senha</label>
        <input 
          type="password"
          name="password_confirmation" 
          placeholder="Repita a senha" 
          onChange={handleChange}
          required 
        />
      </div>

      <div className="btn-group">
        <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Voltar</button>
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