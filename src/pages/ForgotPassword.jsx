import React, { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    try { await api.post('/api/v1/forgot-password', { email }); setStep(2); } 
    catch { alert("Erro"); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {step === 1 ? (
          <form onSubmit={handleRequest}>
            <h2>Recuperar Senha</h2>
            <input placeholder="E-mail" onChange={e => setEmail(e.target.value)} />
            <button className="btn-primary">Enviar Código</button>
          </form>
        ) : <p>Verifique seu e-mail.</p>}
      </div>
    </div>
  );
}