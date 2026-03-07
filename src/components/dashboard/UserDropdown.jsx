import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fecha o menu ao clicar fora
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

      {/* MODAL SOBREPOSTO (PORTAL) */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        contentClassName="custom-modal-content"
        backdropClassName="modal-backdrop-custom"
      >
        <div className="modal-header-custom d-flex justify-content-between align-items-center mb-4">
          <h4 className="m-0 text-white fw-bold">Minha Identidade AxionID</h4>
          <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
        </div>

        <div className="modal-data-body">
          <Row>
            {/* Dados Pessoais */}
            <Col col={12} className="mb-4">
              <h6 className="text-primary mb-3 small fw-bold">DADOS PESSOAIS</h6>
              <div className="mb-3">
                <label className="data-label">NOME COMPLETO</label>
                <div className="data-value">{user?.name}</div>
              </div>
              <div className="mb-3">
                <label className="data-label">E-MAIL CORPORATIVO</label>
                <div className="data-value">{user?.email}</div>
              </div>
              <div className="mb-3">
                <label className="data-label">CPF/CNPJ</label>
                <div className="data-value">{user?.cpf_cnpj || 'Não informado'}</div>
              </div>
            </Col>

            <hr className="border-secondary opacity-25 mb-4" />

            {/* Endereço */}
            <Col col={12}>
              <h6 className="text-primary mb-3 small fw-bold">ENDEREÇO DE REGISTRO</h6>
              {user?.address ? (
                <Row className="g-3">
                  <Col md={12}>
                    <label className="data-label">LOGRADOURO</label>
                    <div className="data-value">{user.address.street}, {user.address.number}</div>
                  </Col>
                  <Col md={6}>
                    <label className="data-label">BAIRRO</label>
                    <div className="data-value">{user.address.neighborhood}</div>
                  </Col>
                  <Col md={6}>
                    <label className="data-label">CIDADE/UF</label>
                    <div className="data-value">{user.address.city} - {user.address.state}</div>
                  </Col>
                  <Col md={12}>
                    <label className="data-label">CEP</label>
                    <div className="data-value">{user.address.zip_code}</div>
                  </Col>
                </Row>
              ) : (
                <div className="text-dim small italic">Nenhum endereço vinculado ao perfil.</div>
              )}
            </Col>
          </Row>
        </div>

        <Button variant="dark" className="w-100 mt-4 py-2 fw-bold" onClick={() => setShowModal(false)}>
          Fechar
        </Button>
      </Modal>
    </div>
  );
};

export default UserDropdown;