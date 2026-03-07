import React, { useState, useEffect, useRef } from 'react';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // Estado para o "Modal" customizado
  const dropdownRef = useRef(null);
  const detailsRef = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Opcional: fechar detalhes ao clicar fora também
      if (detailsRef.current && !detailsRef.current.contains(event.target) && !event.target.closest('.menu-item')) {
        setShowDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Gatilho do Avatar */}
      <button 
        className="avatar-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </button>

      {/* 1. DROPDOWN DE OPÇÕES (O que você já tinha) */}
      {isOpen && (
        <ul className="dropdown-floating-menu">
          <li className="menu-header">
            <span className="info-label">Logado como:</span>
            <span className="info-name text-truncate d-block">{user?.name}</span>
            <span className="info-email text-truncate d-block">{user?.email}</span>
          </li>
          <li className="menu-divider"></li>
          <li>
            <button className="menu-item" onClick={() => { setShowDetails(true); setIsOpen(false); }}>
              <i className="bi bi-person"></i> Meus Detalhes
            </button>
          </li>
          <li>
            <button className="menu-item logout-action" onClick={onLogout}>
              <i className="bi bi-box-arrow-right"></i> Sair
            </button>
          </li>
        </ul>
      )}

      {/* 2. "MODAL" DE DETALHES COM O MESMO ESTILO DO DROPDOWN */}
      {showDetails && (
        <div 
          className="dropdown-floating-menu details-panel" 
          ref={detailsRef}
          style={{ 
            width: '300px', 
            right: 0, 
            top: '100%', 
            padding: '20px',
            marginTop: '10px' 
          }}
        >
          <div className="menu-header mb-3">
            <h5 className="m-0 text-white fw-bold" style={{ fontSize: '1.1rem' }}>Minha Identidade</h5>
            <small className="text-muted">AxionID</small>
          </div>

          <div className="details-content">
            <h6 className="text-primary-custom mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>DADOS PESSOAIS</h6>
            
            <div className="data-field mb-2">
              <label className="d-block text-muted small">NOME COMPLETO</label>
              <span className="text-white d-block">{user?.name}</span>
            </div>

            <div className="data-field mb-2">
              <label className="d-block text-muted small">E-MAIL CORPORATIVO</label>
              <span className="text-white d-block">{user?.email}</span>
            </div>

            <div className="data-field mb-3">
              <label className="d-block text-muted small">CPF/CNPJ</label>
              <span className="text-white d-block">{user?.cpf_cnpj || '12328361765'}</span>
            </div>

            <div className="menu-divider mb-3"></div>

            <h6 className="text-primary-custom mb-2" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>ENDEREÇO DE REGISTRO</h6>
            {user?.address ? (
              <div className="address-info" style={{ fontSize: '0.9rem' }}>
                <div className="mb-2">
                  <label className="d-block text-muted small">LOGRADOURO</label>
                  <span className="text-white">{user.address.street}, {user.address.number}</span>
                </div>
                <div className="mb-2">
                  <label className="d-block text-muted small">BAIRRO</label>
                  <span className="text-white">{user.address.neighborhood}</span>
                </div>
                <div className="mb-2">
                  <label className="d-block text-muted small">CIDADE/UF</label>
                  <span className="text-white">{user.address.city} - {user.address.state}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted small">Dados de endereço não disponíveis.</p>
            )}
          </div>

          <button 
            className="menu-item mt-3 text-center w-100" 
            style={{ justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}
            onClick={() => setShowDetails(false)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;