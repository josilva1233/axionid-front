import React, { useState, useEffect, useRef } from 'react';

import '../../Identidade.css';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);
  const detailsRef = useRef(null);

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
      <button 
        className={`avatar-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Menu do Usuário"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </button>

      {isOpen && (
        <div className="dropdown-floating-menu">
          <div className="menu-header">
            <span className="info-label">Sessão ativa:</span>
            <span className="info-name text-truncate">{user?.name}</span>
            <span className="info-email text-truncate">{user?.email}</span>
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

      {showDetails && (
<div className="dropdown-floating-menu details-panel" ref={detailsRef}>
  <header className="menu-header">
    <h5 className="text-white fw-bold mb-0">Minha Identidade</h5>
    <span className="badge-operacional success">Verificada</span>
  </header>

  <main className="details-content custom-scrollbar">
    <section className="info-section">
      <p className="section-subtitle">Dados da Conta</p>
      
      <div className="data-field">
        <span className="label">Nome Completo</span>
        <span className="value">{user?.name || 'Não informado'}</span>
      </div>

      <div className="data-field">
        <span className="label">E-mail Cadastrado</span>
        <span className="value">{user?.email || 'Não informado'}</span>
      </div>

      <div className="data-field">
        <span className="label">Documento ID</span>
        <span className="value mono-text">{user?.cpf_cnpj || 'Não informado'}</span>
      </div>
    </section>

    <div className="menu-divider"></div>

    <section className="info-section">
      <p className="section-subtitle">Endereço Registrado</p>
      {user?.address ? (
        <div className="address-info-stack">
          <div className="data-field">
            <span className="label">Logradouro</span>
            <span className="value">{user.address.street}, {user.address.number}</span>
          </div>
          <div className="data-field">
            <span className="label">Cidade / UF</span>
            <span className="value">{user.address.city} - {user.address.state}</span>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <span className="text-dim italic small">Nenhum endereço vinculado à ID.</span>
        </div>
      )}
    </section>
  </main>

  <footer className="menu-footer">
    <button 
      type="button"
      className="btn-secondary w-100" 
      onClick={() => setShowDetails(false)}
    >
      Fechar Painel
    </button>
  </footer>
</div>
      )}
    </div>
  );
};

export default UserDropdown;