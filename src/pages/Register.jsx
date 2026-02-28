import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. Lógica de detecção: se tem 'from_google', mudamos o comportamento do form
  const isFromGoogle = searchParams.get('from_google') === 'true';

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isFromGoogle
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 2. Preparação do payload: 
    // Se veio do Google, o usuário não criou senha. Geramos uma automática 
    // para não quebrar a validação 'required' do Laravel.
    const dataToSend = { ...formData };
    if (isFromGoogle) {
      const autoPass = "SocialAuth_" + Math.random().toString(36).slice(-8);
      dataToSend.password = autoPass;
      dataToSend.password_confirmation = autoPass;
    }

    try {
      const response = await api.post('/api/v1/register', dataToSend);
      
      // 3. Se o registro deu certo, salvamos o token e entramos
      if (response.data.token) {
        localStorage.setItem('axion_token', response.data.token);
      }

      alert('Cadastro finalizado com sucesso!');
      navigate('/dashboard'); 

    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao finalizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3>{isFromGoogle ? 'Só mais um passo!' : 'Crie sua conta'}</h3>
        
        {isFromGoogle && (
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Olá <strong>{formData.name}</strong>, confirme seus dados e informe seu CPF para concluir.
          </p>
        )}

        <form onSubmit={handleRegister} className="auth-form">
          
          {/* Nome e Email: Desabilitados se vierem do Google */}
          <div className="input-group">
            <input 
              name="name" 
              placeholder="Nome Completo"
              value={formData.name} 
              onChange={handleChange} 
              disabled={isFromGoogle}
              required 
            />
          </div>

          <div className="input-group">
            <input 
              name="email" 
              type="email"
              placeholder="E-mail"
              value={formData.email} 
              onChange={handleChange} 
              disabled={isFromGoogle}
              required 
            />
          </div>

          {/* O campo principal que falta */}
          <div className="input-group">
            <input 
              name="cpf_cnpj" 
              placeholder="Digite seu CPF ou CNPJ" 
              value={formData.cpf_cnpj}
              onChange={handleChange} 
              required 
              autoFocus 
            />
          </div>

          {/* SÓ exibe campos de senha se NÃO for Google */}
          {!isFromGoogle && (
            <>
              <div className="input-group">
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Crie uma senha"
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  name="password_confirmation" 
                  type="password" 
                  placeholder="Confirme a senha"
                  onChange={handleChange} 
                  required 
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processando...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}