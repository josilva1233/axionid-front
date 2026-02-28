import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Define se o registro é via rede social baseado na presença do e-mail na URL
  const isSocialRegistration = !!searchParams.get('email');

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/v1/register', formData);
      alert('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3>{isSocialRegistration ? 'Finalize seu Cadastro' : 'Crie sua conta profissional'}</h3>

        {/* Banner informativo exibido apenas se vier do Google */}
        {isSocialRegistration && (
          <div style={{ 
            background: '#f0f7ff', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            borderLeft: '4px solid #4285f4' 
          }}>
            Logado como: <strong>{formData.email}</strong>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="auth-form">
          
          {/* Só exibe Nome e Email se NÃO for registro social */}
          {!isSocialRegistration && (
            <>
              <input 
                name="name"
                placeholder="Nome Completo" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              
              <input 
                name="email"
                type="email"
                placeholder="E-mail" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </>
          )}

          <input 
            name="cpf_cnpj"
            placeholder="CPF ou CNPJ" 
            value={formData.cpf_cnpj} 
            onChange={handleChange} 
            required 
          />

          <input 
            name="password"
            type="password" 
            placeholder="Senha" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />

          <input 
            name="password_confirmation"
            type="password" 
            placeholder="Confirmar Senha" 
            value={formData.password_confirmation} 
            onChange={handleChange} 
            required 
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : isSocialRegistration ? 'Concluir Cadastro' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}