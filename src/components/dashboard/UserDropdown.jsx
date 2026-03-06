import { Dropdown } from "react-bootstrap";

export default function UserDropdown({ user, onLogout, onProfileClick }) {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="transparent" className="border-0 d-flex align-items-center gap-2">
        <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
      </Dropdown.Toggle>
      <Dropdown.Menu title="Menu" className="dropdown-menu-dark">
        <Dropdown.Item onClick={onProfileClick}>Meu Perfil</Dropdown.Item>
        <Dropdown.Divider />
        <Dropdown.Item onClick={onLogout} className="text-danger">Sair</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}