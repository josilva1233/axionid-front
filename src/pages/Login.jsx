import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [step, setStep] = useState(1); // Controla qual parte do formulário aparece
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: ''
  });
  
  const navigate = useNavigate();

  // ONDE CORRIGIR: Dentro do useEffect principal da página de Registro
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const stepParam = params.get('step');
    const nameParam = params.get('name');
    const emailParam = params.get('email');

    // Se o Laravel redirecionou com step=2 (Vindo do Google)
    if (token && stepParam === '2') {
      // 1. Salva o token para que a chamada de 'complete-profile' funcione
      localStorage.setItem('@AxionID:token', token);
      
      // 2. Preenche os dados que já vieram do Google e pula para o passo 2
      setFormData(prev => ({
        ...prev,
        name: nameParam || '',
        email: emailParam || ''
      }));
      setStep(2); 
    }
  }, []);

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      // Chamada para a rota que criamos no Laravel
      await api.post('/api/v1/complete-profile', {
        cpf_cnpj: formData.cpf_cnpj,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });
      
      navigate('/dashboard');
    } catch (err) {
      alert('Erro ao finalizar cadastro: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="auth-container">
      {step === 1 ? (
        <form>{/* Seu formulário normal de Passo 1 (Nome/Email) */}</form>
      ) : (
        <form onSubmit={handleCompleteProfile} className="auth-form">
          <h2>Finalize seu Cadastro</h2>
          <p>Olá {formData.name}, informe seu CPF e crie uma senha para sua AxionID.</p>
          
          <input 
            type="text" 
            placeholder="CPF ou CNPJ" 
            value={formData.cpf_cnpj}
            onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Nova Senha" 
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="Confirme a Senha" 
            value={formData.password_confirmation}
            onChange={e => setFormData({...formData, password_confirmation: e.target.value})}
            required
          />
          
          <button type="submit" className="btn-primary">Concluir e Acessar</button>
        </form>
      )}
    </div>
  );
}