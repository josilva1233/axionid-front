import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Onboarding() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // De acordo com seu Swagger, o endpoint de completar perfil é:
      // POST /api/v1/complete-profile
      await api.post('/api/v1/complete-profile', {
        cpf_cnpj: cpfCnpj, // Enviando o campo que faltava no login social
      });

      // Após salvar, limpamos a flag de necessidade de CPF e vamos para o Dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Erro silencioso
    } finally {
      setLoading(false);
    }
    // No Dashboard.jsx
useEffect(() => {
  const checkUserProfile = async () => {
    try {
      const response = await api.get('/api/v1/me'); // Rota que retorna os dados do usuário logado
      const user = response.data;

      if (!user.cpf_cnpj) {
        alert("Bem-vindo! Precisamos que você complete seu cadastro antes de continuar.");
        navigate('/register?from_google=true&name=' + user.name + '&email=' + user.email);
      }
    } catch (error) {
      console.error("Erro ao validar perfil");
    }
  };

  checkUserProfile();
}, []);
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
        
        <div className="onboarding-header">
          <h2>Finalize seu perfil</h2>
          <p>Detectamos que você entrou via conta social. Para sua segurança, informe seu CPF ou CNPJ.</p>
        </div>

        <form onSubmit={handleCompleteRegistration} className="auth-form">
          <div className="input-group">
            <label>CPF ou CNPJ</label>
            <input 
              type="text" 
              placeholder="000.000.000-00" 
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Concluir e Acessar Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}