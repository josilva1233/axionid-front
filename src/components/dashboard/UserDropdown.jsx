import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function UserDropdown({ user, onLogout, onProfileClick }) {
  const navigate = useNavigate();

  // Se o usuário ainda não carregou, não renderiza nada para evitar erro de undefined
  if (!user) return null;

  return (
    <Dropdown align="end" className="user-dropdown">
      <Dropdown.Toggle id="dropdown-user" className="bg-transparent border-0 d-flex align-items-center gap-2 shadow-none">
        <div className="user-info text-end d-none d-sm-block">
          <p className="user-name mb-0 text-white fw-bold" style={{ fontSize: '0.9rem' }}>
            {user.name}
          </p>
          <small className="text-primary text-uppercase" style={{ fontSize: '0.7rem' }}>
            {user.role}
          </small>
        </div>
        <div className="avatar-circle">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="dropdown-menu-dark border-secondary shadow-lg mt-2">
        <Dropdown.Header className="text-dim small">Minha Conta</Dropdown.Header>
        
        {/* Ação para trocar a aba no Dashboard para "Perfil" */}
        <Dropdown.Item onClick={onProfileClick} className="py-2">
          <i className="bi bi-person me-2"></i> Meu Perfil
        </Dropdown.Item>

        <Dropdown.Divider className="border-secondary" />
        
        <Dropdown.Item onClick={onLogout} className="text-danger py-2">
          <i className="bi bi-box-arrow-right me-2"></i> Sair do Sistema
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}