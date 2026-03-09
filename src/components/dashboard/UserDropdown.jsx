import React, { useState, useEffect, useRef } from "react";

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
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target) &&
        !event.target.closest(".menu-item")
      ) {
        setShowDetails(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="user-dropdown-container" ref={dropdownRef}>
      {/* Gatilho do Avatar - Estilo AxionID */}
      <button
        className={`avatar-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Menu do Usuário"
      >
        {user?.name?.charAt(0).toUpperCase() || "U"}
      </button>

      {/* 1. MENU FLUTUANTE DE OPÇÕES */}
      {isOpen && (
        <div className="dropdown-floating-menu animate-in">
          <div className="menu-header">
            <span className="info-label text-dim">Sessão ativa:</span>
            <span className="info-name text-truncate">{user?.name}</span>
            <span className="info-email text-truncate text-dim small">
              {user?.email}
            </span>
          </div>

          <div className="menu-divider"></div>

          <div className="menu-body">
            <button
              className="menu-item"
              onClick={() => {
                setShowDetails(true);
                setIsOpen(false);
              }}
            >
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
        <div className="details-panel-floating animate-in" ref={detailsRef}>
          {/* Header com estilo de Card Premium */}
          <div className="panel-header">
            <div className="header-content">
              <h5 className="title">Minha Identidade</h5>
              <span className="status-badge">
                <i className="bi bi-patch-check-fill me-1"></i> Verificada
              </span>
            </div>
            <button
              className="btn-close-panel"
              onClick={() => setShowDetails(false)}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="panel-body custom-scrollbar">
            {/* Seção: Dados Pessoais */}
            <section className="info-group">
              <p className="group-label">Dados da Conta</p>

              <div className="info-item">
                <div className="icon-box">
                  <i className="bi bi-person"></i>
                </div>
                <div className="content">
                  <label>Nome Completo</label>
                  <span>{user?.name}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box">
                  <i className="bi bi-envelope"></i>
                </div>
                <div className="content">
                  <label>E-mail Cadastrado</label>
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="icon-box">
                  <i className="bi bi-card-heading"></i>
                </div>
                <div className="content">
                  <label>Documento ID</label>
                  <span className="mono">
                    {user?.cpf_cnpj || "Não informado"}
                  </span>
                </div>
              </div>
            </section>

            <div className="separator"></div>

            {/* Seção: Localização */}
            <section className="info-group">
              <p className="group-label">Endereço Registrado</p>
              {user?.address ? (
                <div className="info-item">
                  <div className="icon-box">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="content">
                    <label>Logradouro e Cidade</label>
                    <span>
                      {user.address.street}, {user.address.number}
                    </span>
                    <small>
                      {user.address.city} — {user.address.state}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <i className="bi bi-info-circle me-2"></i>
                  Nenhum endereço vinculado.
                </div>
              )}
            </section>
          </div>

          <div className="panel-footer">
            <button
              className="btn-action-primary w-100"
              onClick={() => {
                /* Logica de editar */
              }}
            >
              <i className="bi bi-pencil me-2"></i> Editar Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
