import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../Login.css';

export default function Onboarding() {
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/v1/complete-profile', {
        cpf_cnpj: cpfCnpj,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro ao salvar seus dados. Verifique o formato do documento.');
      console.error("Erro no onboarding", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
        
        <div className="auth-header">
          <h2>Finalize seu perfil</h2>
          <p>Para garantir a segurança da sua conta, precisamos validar sua identidade digital.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCompleteRegistration} className="auth-form">
          <div className="input-group">
            <label>Documento de Identificação</label>
            <input 
              type="text" 
              placeholder="CPF ou CNPJ (apenas números)" 
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
              autoFocus
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Validando dados...' : 'Concluir e Acessar Painel'}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
            Seus dados são criptografados e protegidos por protocolos de segurança AxionID.
          </p>
        </div>
      </div>
    </div>
  );
}