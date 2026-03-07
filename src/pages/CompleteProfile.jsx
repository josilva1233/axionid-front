import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cpf_cnpj: '', zip_code: '', street: '', number: '', 
    neighborhood: '', city: '', state: '', password: '', password_confirmation: ''
  });

  const handleZipCodeBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({ ...prev, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, zip_code: cep }));
      }
    } catch (err) { console.error("CEP error"); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="step">
              <h2>Identificação</h2>
              <input value={formData.cpf_cnpj} onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} placeholder="CPF ou CNPJ" />
              <button type="button" onClick={() => setStep(2)}>Próximo</button>
            </div>
          )}
          {step === 2 && (
            <div className="step">
              <h2>Endereço</h2>
              <input onBlur={handleZipCodeBlur} placeholder="CEP" />
              <input value={formData.street} readOnly placeholder="Rua" />
              <input placeholder="Número" onChange={e => setFormData({...formData, number: e.target.value})} />
              <button onClick={() => setStep(3)}>Próximo</button>
            </div>
          )}
          {step === 3 && (
            <div className="step">
              <h2>Segurança</h2>
              <input type="password" placeholder="Senha" onChange={e => setFormData({...formData, password: e.target.value})} />
              <button onClick={async () => {
                setLoading(true);
                try { await api.post('/api/v1/complete-profile', formData); navigate('/dashboard'); } 
                catch { alert("Erro"); } finally { setLoading(false); }
              }}>{loading ? 'Salvando...' : 'Finalizar'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}