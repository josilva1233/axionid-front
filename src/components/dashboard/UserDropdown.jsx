import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Row, Col } from 'react-bootstrap';

const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
            <span className="info-name text-truncate d-block">{user?.name}</span>
            <span className="info-email text-truncate d-block">{user?.email}</span>
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

      {/* MODAL CORRIGIDO PARA SOBREPOSIÇÃO */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        dialogClassName="modal-centered-custom"
        contentClassName="custom-modal-content"
        backdropClassName="custom-modal-backdrop"
      >
        <div className="modal-header-custom">
          <h4 className="m-0 text-white fw-bold">Minha Identidade AxionID</h4>
          <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
        </div>

        <div className="modal-data-body">
          <Row className="g-4">
            <Col xs={12}>
              <h6 className="text-primary-custom mb-3">DADOS PESSOAIS</h6>
              <div className="data-field">
                <label>NOME COMPLETO</label>
                <span>{user?.name}</span>
              </div>
              <div className="data-field">
                <label>E-MAIL CORPORATIVO</label>
                <span>{user?.email}</span>
              </div>
              <div className="data-field">
                <label>CPF/CNPJ</label>
                <span>{user?.cpf_cnpj || 'Não informado'}</span>
              </div>
            </Col>

            <Col xs={12}>
              <div className="modal-divider"></div>
              <h6 className="text-primary-custom mb-3">ENDEREÇO DE REGISTRO</h6>
              {user?.address ? (
                <Row className="g-3">
                  <Col xs={12}>
                    <div className="data-field">
                      <label>LOGRADOURO</label>
                      <span>{user.address.street}, {user.address.number}</span>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="data-field">
                      <label>BAIRRO</label>
                      <span>{user.address.neighborhood}</span>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="data-field">
                      <label>CIDADE/UF</label>
                      <span>{user.address.city} - {user.address.state}</span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="data-field">
                      <label>CEP</label>
                      <span>{user.address.zip_code}</span>
                    </div>
                  </Col>
                </Row>
              ) : (
                <p className="text-muted small">Endereço não vinculado.</p>
              )}
            </Col>
          </Row>
        </div>

        <div className="modal-footer-custom mt-4">
          <Button variant="dark" className="btn-modal-close w-100" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserDropdown;