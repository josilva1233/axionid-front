import { useNavigate } from "react-router-dom";

{
  /* Filtros para Usuários */
}
{
  activeTab === "users" && role === "admin" && (
    <div
      className="filter-card mb-4 p-3"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Row className="align-items-end g-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label
              className="text-uppercase fw-bold mb-2"
              style={{
                color: "#6c757d",
                fontSize: "0.7rem",
                letterSpacing: "1px",
              }}
            >
              Buscar por Nome ou E-mail
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Digite o nome do usuário..."
              value={filters.name}
              onChange={handleFilterChange}
              className="custom-input-dark"
            />
          </Form.Group>
        </Col>
        <Col md={4} className="d-flex gap-2">
          <button className="btn-primary w-100" onClick={() => loadUsers(1)}>
            Buscar
          </button>
          <button
            className="btn-action-outline px-4"
            onClick={() => {
              setFilters({ ...filters, name: "" });
              loadUsers(1);
            }}
          >
            Limpar
          </button>
        </Col>
      </Row>
    </div>
  );
}
export default function UserTable({ users }) {
  const navigate = useNavigate();
  return (
    <div className="table-card">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Acesso</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="mono-text">#{u.id}</td>
              <td>
                <strong>{u.name}</strong>
              </td>
              <td>{u.email}</td>
              <td>{u.is_admin ? "Admin" : "User"}</td>
              <td>
                <span className={`badge ${u.is_active ? "success" : "danger"}`}>
                  {u.is_active ? "Ativo" : "Bloqueado"}
                </span>
              </td>
              <td>
                <button
                  className="btn-small"
                  onClick={() => navigate(`/dashboard/user/${u.id}`)}
                >
                  Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
