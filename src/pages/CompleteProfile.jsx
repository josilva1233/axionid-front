import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ cpf_cnpj: '', zip_code: '', street: '', number: '', neighborhood: '', city: '', state: '' });

  const checkCEP = async (cep) => {
    if (cep.length !== 8) return;
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (!data.erro) setFormData({...formData, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf, zip_code: cep});
  };

  const handleFinish = async () => {
    try { await api.post('/api/v1/complete-profile', formData); navigate('/dashboard'); } 
    catch { alert("Erro ao salvar."); }
  };

  return (
    <div className="auth-container animate-in">
      <div className="auth-card">
        {step === 1 && (
          <div>
            <h3>Passo 1: Identificação</h3>
            <div className="input-group"><label>CPF/CNPJ</label><input type="text" onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} /></div>
            <button className="btn-primary" onClick={() => setStep(2)}>Próximo</button>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3>Passo 2: Endereço</h3>
            <div className="input-group"><label>CEP</label><input type="text" onBlur={e => checkCEP(e.target.value)} /></div>
            <div className="input-group"><label>Rua</label><input type="text" value={formData.street} readOnly /></div>
            <div className="input-group"><label>Número</label><input type="text" onChange={e => setFormData({...formData, number: e.target.value})} /></div>
            <button className="btn-primary" onClick={handleFinish}>Finalizar</button>
          </div>
        )}
      </div>
    </div>
  );
}