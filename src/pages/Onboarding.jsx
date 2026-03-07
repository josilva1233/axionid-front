import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="auth-container animate-in">
      <div className="auth-card" style={{textAlign: 'center'}}>
        <div style={{fontSize: '4rem', marginBottom: '20px'}}>🚀</div>
        <h2>Quase lá!</h2>
        <p style={{color: 'var(--text-dim)', margin: '15px 0 30px'}}>
          Sua conta foi criada, mas precisamos de algumas informações adicionais para liberar seu acesso total.
        </p>
        <button className="btn-primary" onClick={() => navigate('/complete-profile')}>
          Completar Meu Perfil
        </button>
      </div>
    </div>
  );
}