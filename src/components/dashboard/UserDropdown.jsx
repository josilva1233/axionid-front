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
        size="lg"
        contentClassName="glass-card border-0 text-white"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary border-opacity-25">
          <Modal.Title className="fw-bold">Minha Identidade AxionID</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <Row className="g-4">
            {/* Informações Pessoais */}
            <Col md={6}>
              <h6 className="text-primary mb-3 text-uppercase small fw-bold">Dados Pessoais</h6>
              <div className="mb-2">
                <label className="text-dim small d-block">Nome Completo</label>
                <span className="fw-medium">{user?.name}</span>
              </div>
              <div className="mb-2">
                <label className="text-dim small d-block">E-mail</label>
                <span className="fw-medium">{user?.email}</span>
              </div>
              <div className="mb-2">
                <label className="text-dim small d-block">CPF/CNPJ</label>
                <span className="fw-medium">{user?.cpf_cnpj || 'Não informado'}</span>
              </div>
            </Col>

            {/* Endereço */}
            <Col md={6}>
              <h6 className="text-primary mb-3 text-uppercase small fw-bold">Endereço de Registro</h6>
              {user?.address ? (
                <>
                  <div className="mb-2">
                    <label className="text-dim small d-block">Logradouro</label>
                    <span className="fw-medium">{user.address.street}, {user.address.number}</span>
                  </div>
                  <div className="mb-2">
                    <label className="text-dim small d-block">Bairro/Cidade</label>
                    <span className="fw-medium">{user.address.neighborhood}, {user.address.city} - {user.address.state}</span>
                  </div>
                  <div className="mb-2">
                    <label className="text-dim small d-block">CEP</label>
                    <span className="fw-medium">{user.address.zip_code}</span>
                  </div>
                </>
              ) : (
                <p className="text-warning small italic">Endereço não preenchido.</p>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-secondary border-opacity-25">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDropdown;