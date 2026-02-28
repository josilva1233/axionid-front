import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Detecta se veio do Google
  const isSocialRegistration = !!searchParams.get('from_google');

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envia os dados para o seu servidor Ubuntu
      const response = await api.post('/api/v1/register', formData);
      
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
        localStorage.setItem('@AxionID:role', response.data.user?.is_admin ? 'admin' : 'user');
      }

      alert('Cadastro finalizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3>{isSocialRegistration ? 'Finalize seu Cadastro' : 'Crie sua conta'}</h3>
        
        <form onSubmit={handleRegister} className="auth-form">
          
          <div className="input-group">
            <label>Nome Completo</label>
            <input 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              readOnly={isSocialRegistration} // Bloqueia edição se vier do Google
              style={isSocialRegistration ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
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
              readOnly={isSocialRegistration} // Bloqueia edição se vier do Google
              style={isSocialRegistration ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
              required 
            />
          </div>

          <div className="input-group">
            <label>CPF ou CNPJ</label>
            <input 
              name="cpf_cnpj"
              placeholder="000.000.000-00" 
              value={formData.cpf_cnpj} 
              onChange={handleChange} 
              required 
              autoFocus 
            />
          </div>

          {/* Campos de Senha (Sempre visíveis conforme solicitado) */}
          <div className="input-group">
            <label>Defina uma Senha</label>
            <input 
              name="password"
              type="password" 
              placeholder="Mínimo 8 caracteres" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Confirme a Senha</label>
            <input 
              name="password_confirmation"
              type="password" 
              placeholder="Repita a senha" 
              value={formData.password_confirmation} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}