import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="auth-container animate-in">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="brand mb-4">
          <h1>Axion<span>ID</span></h1>
        </div>
        <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🚀</div>
        <h2 className="mb-3">Bem-vindo a bordo!</h2>
        <p className="text-dim mb-4">
          Sua conta foi criada com sucesso. Para garantir a segurança e o acesso total aos recursos, precisamos que você complete seu perfil.
        </p>
        <div className="d-flex flex-column gap-3">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/complete-profile')}
          >
            Completar Perfil Agora
          </button>
          <button 
            className="btn-primary" 
            style={{ background: 'transparent', border: '1px solid var(--border)' }}
            onClick={() => navigate('/dashboard')}
          >
            Ir para o Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}