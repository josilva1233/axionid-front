import React, { useState } from 'react';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', cpf_cnpj: '', password: '' });

// Trecho final da função handleRegister no Register.js
const handleRegister = async (e) => {
  e.preventDefault();
  try { 
    await api.post('/api/v1/register', form); 
    // Em vez de mandar para o login, manda para o Onboarding
    navigate('/onboarding'); 
  } catch (err) { 
    alert("Erro ao registrar: " + err.response?.data?.message); 
  }
};
  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Criar Conta</h2>
        <input placeholder="Nome" onChange={e => setForm({...form, name: e.target.value})} />
        <input placeholder="E-mail" onChange={e => setForm({...form, email: e.target.value})} />
        <button className="btn-primary">Registrar</button>
      </form>
    </div>
  );
}