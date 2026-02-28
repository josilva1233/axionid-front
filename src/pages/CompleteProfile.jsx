import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: Documento, 2: Endereço

  const [formData, setFormData] = useState({
    cpf_cnpj: '',
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: ''
  });

  // Busca CEP automática
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
          // Limpa erros de endereço se houver
          setErrors(prev => ({ ...prev, zip_code: null }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/complete-profile', formData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        const messages = Object.values(error.response.data.errors).flat().join('\n');
        alert("Verifique os campos:\n" + messages);
      } else {
        alert("Erro ao conectar com o servidor.");
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
          
          {/* PASSO 1: DOCUMENTAÇÃO */}
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
                {errors.cpf_cnpj && <span className="error-msg">{errors.cpf_cnpj[0]}</span>}
              </div>
              <button type="button" className="btn-primary" onClick={() => setStep(2)} disabled={!formData.cpf_cnpj}>
                Próximo passo
              </button>
            </div>
          )}

          {/* PASSO 2: ENDEREÇO (ZIP CODE) */}
          {step === 2 && (
            <div className="step-content animate-in">
              <h3>Endereço</h3>
              <p>Digite seu CEP para preenchimento automático.</p>
              
              <div className="input-group">
                <label>CEP</label>
                <input 
                  name="zip_code" 
                  placeholder="00000-000" 
                  onBlur={handleZipCodeBlur}
                  onChange={handleChange}
                  required 
                />
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
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Concluir Cadastro'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}