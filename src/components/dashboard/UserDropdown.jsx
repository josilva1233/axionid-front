import React, { useState, useEffect, useRef } from 'react';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);
  const detailsRef = useRef(null);

  // Fecha ao clicar fora de ambos os painéis
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (detailsRef.current && !detailsRef.current.contains(event.target) && !event.target.closest('.menu-item')) {
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      {/* Gatilho do Avatar - Estilo AxionID */}
      <button 
        className={`avatar-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Menu do Usuário"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </button>

      {/* 1. MENU FLUTUANTE DE OPÇÕES */}
      {isOpen && (
        <div className="dropdown-floating-menu animate-in">
          <div className="menu-header">
            <span className="info-label text-dim">Sessão ativa:</span>
            <span className="info-name text-truncate">{user?.name}</span>
            <span className="info-email text-truncate text-dim small">{user?.email}</span>
          </div>
          
          <div className="menu-divider"></div>
          
          <div className="menu-body">
            <button className="menu-item" onClick={() => { setShowDetails(true); setIsOpen(false); }}>
              <span className="menu-icon">👤</span> Meus Detalhes
            </button>
            
            <button className="menu-item logout-action" onClick={onLogout}>
              <span className="menu-icon">🚪</span> Encerrar Sessão
            </button>
          </div>
        </div>
      )}

      {/* 2. PAINEL DE DETALHES (MINI-PERFIL) */}
      {showDetails && (
        <div className="dropdown-floating-menu details-panel animate-in" ref={detailsRef}>
          <div className="menu-header mb-3">
            <h5 className="text-white fw-bold mb-0">Minha Identidade</h5>
            <span className="badge-operacional small">Verificada</span>
          </div>

          <div className="details-content custom-scrollbar">
            <p className="section-subtitle">DADOS DA CONTA</p>
            
            <div className="data-field">
              <label>NOME COMPLETO</label>
              <span>{user?.name}</span>
            </div>

            <div className="data-field">
              <label>E-MAIL CADASTRADO</label>
              <span>{user?.email}</span>
            </div>

            <div className="data-field">
              <label>DOCUMENTO ID</label>
              <span className="mono-text">{user?.cpf_cnpj || 'Não informado'}</span>
            </div>

            <div className="menu-divider my-3"></div>

            <p className="section-subtitle">ENDEREÇO REGISTRADO</p>
            {user?.address ? (
              <div className="address-info-stack">
                <div className="data-field">
                  <label>LOGRADOURO</label>
                  <span>{user.address.street}, {user.address.number}</span>
                </div>
                <div className="data-field">
                  <label>CIDADE / UF</label>
                  <span>{user.address.city} - {user.address.state}</span>
                </div>
              </div>
            ) : (
              <span className="text-dim italic small">Nenhum endereço vinculado à ID.</span>
            )}
          </div>

          <button 
            className="btn-secondary w-100 mt-3" 
            onClick={() => setShowDetails(false)}
          >
            Fechar Painel
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;