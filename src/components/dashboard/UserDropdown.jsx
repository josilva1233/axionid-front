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
  contentClassName="glass-card"
>
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="fs-5 fw-bold">Minha Identidade AxionID</Modal.Title>
  </Modal.Header>
  
  <Modal.Body className="pt-0">
    <div className="info-grid-modal">
      {/* Dados Pessoais */}
      <div>
        <h6 className="text-primary mb-3 small fw-bold">DADOS PESSOAIS</h6>
        <div className="modal-info-group mb-3">
          <label>Nome Completo</label>
          <span>{user?.name}</span>
        </div>
        <div className="modal-info-group mb-3">
          <label>E-mail Corporativo</label>
          <span>{user?.email}</span>
        </div>
        <div className="modal-info-group">
          <label>CPF/CNPJ</label>
          <span>{user?.cpf_cnpj || 'Não informado'}</span>
        </div>
      </div>

      <hr className="border-secondary opacity-25" />

      {/* Endereço */}
      <div>
        <h6 className="text-primary mb-3 small fw-bold">ENDEREÇO DE REGISTRO</h6>
        {user?.address ? (
          <div className="row g-3">
            <div className="col-12 modal-info-group">
              <label>Logradouro</label>
              <span>{user.address.street}, {user.address.number}</span>
            </div>
            <div className="col-6 modal-info-group">
              <label>Bairro</label>
              <span>{user.address.neighborhood}</span>
            </div>
            <div className="col-6 modal-info-group">
              <label>Cidade/UF</label>
              <span>{user.address.city} - {user.address.state}</span>
            </div>
            <div className="col-12 modal-info-group">
              <label>CEP</label>
              <span>{user.address.zip_code}</span>
            </div>
          </div>
        ) : (
          <span className="text-dim small italic">Nenhum endereço vinculado.</span>
        )}
      </div>
    </div>
  </Modal.Body>

  <Modal.Footer className="border-0">
    <Button variant="secondary" className="w-100" onClick={() => setShowModal(false)}>
      Fechar
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default UserDropdown;