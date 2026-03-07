import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap'; // Importações necessárias

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false); // Estado do Modal
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      <button 
        className="avatar-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </button>

      {isOpen && (
        <ul className="dropdown-floating-menu">
          <li className="menu-header">
            <span className="info-label">Logado como:</span>
            <span className="info-name">{user?.name}</span>
            <span className="info-email">{user?.email}</span>
          </li>
          <li className="menu-divider"></li>
          <li>
            <button className="menu-item" onClick={() => { setShowModal(true); setIsOpen(false); }}>
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

      {/* MODAL DE DETALHES DO USUÁRIO */}
<Modal 
  show={showModal} 
  onHide={() => setShowModal(false)} 
  centered 
  dialogClassName="custom-modal-dark" // Adicione esta linha
  contentClassName="dark-modal-content" // E esta
>
  <Modal.Header closeButton className="border-0 pb-0">
    <Modal.Title className="modal-title-custom">Minha Identidade AxionID</Modal.Title>
  </Modal.Header>
  
  <Modal.Body>
    <div className="info-section">
      <h6 className="section-label">DADOS PESSOAIS</h6>
      
      <div className="info-group">
        <label>NOME COMPLETO</label>
        <div className="info-value">{user?.name?.toUpperCase()}</div>
      </div>

      <div className="info-group">
        <label>E-MAIL CORPORATIVO</label>
        <div className="info-value email-value">{user?.email}</div>
      </div>

      <div className="info-group">
        <label>CPF/CNPJ</label>
        <div className="info-value">{user?.cpf_cnpj || '12328361765'}</div>
      </div>
    </div>

    <hr className="modal-divider" />

    <div className="info-section">
      <h6 className="section-label">ENDEREÇO DE REGISTRO</h6>
      
      <div className="info-group">
        <label>LOGRADOURO</label>
        <div className="info-value">{user?.address?.street}, {user?.address?.number}</div>
      </div>

      <div className="info-group">
        <label>BAIRRO</label>
        <div className="info-value">{user?.address?.neighborhood || 'Pilar'}</div>
      </div>

      <div className="info-group">
        <label>CIDADE/UF</label>
        <div className="info-value">{user?.address?.city} - {user?.address?.state}</div>
      </div>

      <div className="info-group">
        <label>CEP</label>
        <div className="info-value">{user?.address?.zip_code}</div>
      </div>
    </div>
  </Modal.Body>

  <Modal.Footer className="border-0 pt-0">
    <button className="btn-modal-close" onClick={() => setShowModal(false)}>
      Fechar
    </button>
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default UserDropdown;