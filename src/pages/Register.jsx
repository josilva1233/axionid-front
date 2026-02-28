import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Detecta se a origem é o Google
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

    // Se veio do Google, o Laravel precisa de uma senha, mas o usuário não precisa criar uma.
    // Enviamos uma senha automática que o usuário não precisa saber.
    const dataToSend = { ...formData };
    if (isFromGoogle) {
      const autoPass = "GoogleAuth_" + Math.random().toString(36).slice(-8);
      dataToSend.password = autoPass;
      dataToSend.password_confirmation = autoPass;
    }

    try {
      await api.post('/api/v1/register', dataToSend);
      alert('Cadastro concluído!');
      navigate('/'); // Volta para o login ou Dashboard
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao completar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h3>{isFromGoogle ? 'Complete seu cadastro' : 'Crie sua conta'}</h3>
        
        <form onSubmit={handleRegister} className="auth-form">
          <label>Nome Completo</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            readOnly={isFromGoogle} // Se veio do Google, não deixa editar o nome
            className={isFromGoogle ? 'input-disabled' : ''}
          />

          <label>E-mail</label>
          <input 
            name="email" 
            value={formData.email} 
            readOnly={isFromGoogle} 
            className={isFromGoogle ? 'input-disabled' : ''}
          />

          <label>CPF ou CNPJ</label>
          <input 
            name="cpf_cnpj" 
            placeholder="Obrigatório para continuar" 
            onChange={handleChange} 
            required 
            autoFocus 
          />

          {/* O SEGREDO: Se NÃO veio do Google, pede senha. Se veio, esconde tudo. */}
          {!isFromGoogle && (
            <>
              <label>Crie uma Senha</label>
              <input name="password" type="password" onChange={handleChange} required={!isFromGoogle} />
              <label>Confirme a Senha</label>
              <input name="password_confirmation" type="password" onChange={handleChange} required={!isFromGoogle} />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}