import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner, Pagination, Form, Row, Col } from "react-bootstrap";
import api from "../services/api";

import Sidebar from "../components/dashboard/Sidebar";
import UserTable from "../components/dashboard/UserTable";
import GroupTable from "../components/dashboard/GroupTable";
import GroupForm from "../components/dashboard/GroupForm";
import AuditTable from "../components/dashboard/AuditTable";
import UserDropdown from "../components/dashboard/UserDropdown";
import UserDetail from "../components/dashboard/UserDetail";
import GroupDetail from "../components/dashboard/GroupDetail";

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4">
      <div className="display-4" style={{ color: "var(--primary)" }}>
        👋
      </div>
    </div>
    <h2 className="text-white mb-2" style={{ fontWeight: "600" }}>
      Bem-vindo, {user?.name}!
    </h2>
    <p
      className="text-dim mx-auto"
      style={{ maxWidth: "500px", lineHeight: "1.6" }}
    >
      Você está logado no painel operacional da <strong>AxionID</strong>.<br />
      Utilize o menu lateral para navegar ou o avatar no topo para ver seu
      perfil.
    </p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("@AxionID:role"));
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    method: "",
    date: "",
  });

  // --- LÓGICA DE CARREGAMENTO (API) ---

  const loadUsers = useCallback(
    async (page = 1) => {
      if (role !== "admin") return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ page });
        if (filters.name) params.append("name", filters.name);
        if (filters.completed !== "")
          params.append("completed", filters.completed);
        const res = await api.get(`/api/v1/users?${params.toString()}`);
        setUsers(res.data.data || res.data);
        setPaginationData(
          res.data.current_page
            ? {
                current: res.data.current_page,
                last: res.data.last_page,
                total: res.data.total,
              }
            : null,
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [role, filters.name, filters.completed],
  );

  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      setGroups(res.data.data || res.data);
      setPaginationData(
        res.data.current_page
          ? {
              current: res.data.current_page,
              last: res.data.last_page,
              total: res.data.total,
            }
          : null,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(
    async (page = 1) => {
      // Verificação de segurança local
      if (role !== "admin") return;

      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString() });

        // Mantendo os filtros de método e data
        if (filters.method) params.append("method", filters.method);
        if (filters.date) params.append("date", filters.date);

        // CORREÇÃO AQUI: Adicionado o prefixo /admin conforme a nova rota da API
        const res = await api.get(
          `/api/v1/admin/audit-logs?${params.toString()}`,
        );

        // O Laravel Paginate retorna os dados dentro de .data
        // res.data é a resposta do Axios, res.data.data são os registros do Laravel
        setAuditLogs(res.data.data || []);

        // Atualização da paginação baseada no retorno do Laravel Paginate
        setPaginationData(
          res.data.current_page
            ? {
                current: res.data.current_page,
                last: res.data.last_page,
                total: res.data.total,
              }
            : null,
        );
      } catch (err) {
        console.error("Erro ao carregar logs de auditoria:", err);
        // Opcional: setAuditLogs([]); para evitar dados antigos em caso de erro
      } finally {
        setLoading(false);
      }
    },
    [filters.method, filters.date, role], // Dependências corretas
  );

  // --- FUNÇÕES DE AÇÃO DO GRUPO ---

  const handleDeleteGroup = useCallback(async (groupId) => {
    if (!window.confirm("Tem certeza que deseja excluir este grupo?")) return;
    setActionLoading(true);
    try {
      // Correção da Rota: adicionado /api/v1
      await api.delete(`/api/v1/groups/${groupId}`);

      // Atualização local do estado
      setGroups((prev) => prev.filter((g) => g.id !== groupId));

      // Reseta a visualização para a lista
      setSelectedGroupId(null);
      setShowGroupForm(false);

      alert("Grupo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar grupo:", error);
      alert(
        error.response?.data?.message || "Não foi possível excluir o grupo.",
      );
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleAddUserToGroup = async (email) => {
    try {
      const userRes = await api.get(
        `/api/v1/users/find-by-email/${encodeURIComponent(email)}`,
      );
      const userId = userRes.data.id;

      await api.post(`/api/v1/groups/${selectedGroupId}/members`, {
        user_id: userId,
      });

      alert("Membro adicionado!");
      loadGroups(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao adicionar");
    }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    if (!window.confirm(`Remover ${userName} do grupo?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${selectedGroupId}/members/${userId}`);
      loadGroups(currentPage);
    } catch (err) {
      alert("Erro ao remover usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/groups", formData);
      alert("Grupo cadastrado com sucesso!");
      setShowGroupForm(false);
      loadGroups(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (id, formData) => {
    setActionLoading(true);
    try {
      await api.put(`/api/v1/users/${id}/update-manual`, formData);
      alert("Usuário atualizado com sucesso!");
      handleViewDetail(id);
      loadUsers(currentPage);
    } catch (err) {
      alert("Erro ao atualizar.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ name: "", method: "", date: "", completed: "" });
    setCurrentPage(1);
  };

  const handlePromoteUser = async (userId) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      // Ajustado para PATCH e passando os IDs na URL conforme o seu Controller
      await api.patch(
        `/v1/groups/${selectedGroupId}/members/${userId}/promote`,
      );

      // Atualização do estado local para refletir a mudança instantaneamente
      setGroups((prevGroups) => {
        return prevGroups.map((group) => {
          if (group.id === selectedGroupId) {
            return {
              ...group,
              users: group.users.map((user) => {
                if (user.id === userId) {
                  return {
                    ...user,
                    pivot: { ...user.pivot, role: "admin" },
                  };
                }
                return user;
              }),
            };
          }
          return group;
        });
      });

      // Opcional: Alerta de sucesso
      // alert("Membro promovido com sucesso!");
    } catch (error) {
      console.error("Erro ao promover:", error);
      const msg = error.response?.data?.message || "Erro ao promover usuário.";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users/${id}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      alert("Erro ao buscar detalhes");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (type) => {
    setActionLoading(true);
    try {
      if (type === "delete") {
        const confirmName = window.prompt(
          `Para excluir "${selectedUser.name}", digite o NOME dele:`,
        );
        if (confirmName !== selectedUser.name) return;
        await api.delete(`/api/v1/users/${selectedUser.id}`);
        setSelectedUser(null);
        loadUsers(currentPage);
        return;
      }
      if (type === "promote")
        await api.post(`/api/v1/users/${selectedUser.id}/promote`);
      if (type === "remove-admin")
        await api.post(`/api/v1/users/${selectedUser.id}/remove-admin`);
      if (type === "toggle-status")
        await api.patch(`/api/v1/users/${selectedUser.id}/toggle-status`);
      handleViewDetail(selectedUser.id);
      loadUsers(currentPage);
    } catch (err) {
      alert("Erro ao processar.");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get("/api/v1/me");
        setCurrentUser(profileRes.data);
      } catch (err) {
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
  }, [activeTab, role, loadUsers, loadAuditLogs, loadGroups, currentPage]);

  const handleLogout = async () => {
    try {
      await api.post("/api/v1/logout");
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const renderPaginationItems = () => {
    if (!paginationData) return null;
    const items = [];
    for (let i = 1; i <= paginationData.last; i++) {
      if (
        i === 1 ||
        i === paginationData.last ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        items.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </Pagination.Item>,
        );
      }
    }
    return items;
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedUser(null);
          setSelectedGroupId(null);
          setShowGroupForm(false);
          setCurrentPage(1);
        }}
        role={role}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <header
          className="main-header"
          style={{
            borderBottom: "1px solid var(--border-color)",
            padding: "1rem 2rem",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <h2 className="brand" style={{ fontSize: "1.25rem", margin: 0 }}>
              {selectedUser
                ? "Detalhes do Usuário"
                : selectedGroupId
                  ? "Gerenciar Membros"
                  : activeTab === "users"
                    ? "Gestão de Usuários"
                    : activeTab === "groups"
                      ? "Gestão de Grupos"
                      : "Auditoria"}
            </h2>
          </div>
          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          {/* BOTÃO REMOVIDO DAQUI PARA ENTRAR NO FILTER-CARD ABAIXO */}

          {selectedUser ? (
            <UserDetail
              user={selectedUser}
              onBack={() => setSelectedUser(null)}
              onAction={handleUserAction}
              onUpdate={handleUpdateUser}
              actionLoading={actionLoading}
            />
          ) : selectedGroupId ? (
            <GroupDetail
              group={groups.find((g) => g.id === selectedGroupId)}
              onBack={() => setSelectedGroupId(null)}
              onAddUser={handleAddUserToGroup}
              onRemoveUser={handleRemoveUserFromGroup}
              onPromoteUser={handlePromoteUser}
              onDeleteGroup={handleDeleteGroup}
              actionLoading={actionLoading}
            />
          ) : (
            <>
              {/* AREA DE FILTROS E AÇÕES RÁPIDAS */}
              {!showGroupForm && !selectedGroupId && (
                <div className="filter-card mb-4 p-4 animate-in">
                  <Row className="align-items-end g-3">
                    {activeTab === "users" && role === "admin" ? (
                      <>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="filter-label">
                              Buscar por Nome
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={filters.name}
                              onChange={handleFilterChange}
                              className="custom-input-dark"
                              placeholder="Ex: João Silva..."
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="filter-label">
                              Status Perfil
                            </Form.Label>
                            <Form.Select
                              name="completed"
                              value={filters.completed}
                              onChange={handleFilterChange}
                              className="custom-input-dark"
                            >
                              <option value="">Todos os status</option>
                              <option value="1">✅ Perfil Completo</option>
                              <option value="0">⚠️ Incompleto</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <button
                            className="btn-filter-clear w-100"
                            onClick={clearFilters}
                          >
                            <i className="bi bi-eraser me-2"></i> Limpar Filtros
                          </button>
                        </Col>
                      </>
                    ) : activeTab === "groups" ? (
                      <>
                        {/* AQUI O BOTÃO + GRUPO COM A "MESMA CARA" DO FILTRO */}
                        <Col md={9}>
                          <div className="d-flex flex-column">
                            <span className="filter-label mb-2">
                              Ações de Grupo
                            </span>
                            <div className="text-dim small">
                              Crie novos grupos para gerenciar permissões de
                              usuários de forma coletiva.
                            </div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <button
                            className="btn-primary-axion w-100 py-2 fw-bold"
                            style={{ height: "45px", borderRadius: "8px" }}
                            onClick={() => setShowGroupForm(true)}
                          >
                            <i className="bi bi-plus-lg me-2"></i> Novo Grupo
                          </button>
                        </Col>
                      </>
                    ) : activeTab === "audit" && role === "admin" ? (
                      <>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="filter-label">
                              Método HTTP
                            </Form.Label>
                            <Form.Select
                              name="method"
                              value={filters.method}
                              onChange={handleFilterChange}
                              className="custom-input-dark"
                            >
                              <option value="">Todos os métodos</option>
                              <option value="GET">GET - Leitura</option>
                              <option value="POST">POST - Criação</option>
                              <option value="PUT">PUT - Edição</option>
                              <option value="DELETE">DELETE - Remoção</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="filter-label">
                              Data do Evento
                            </Form.Label>
                            <Form.Control
                              type="date"
                              name="date"
                              value={filters.date}
                              onChange={handleFilterChange}
                              className="custom-input-dark"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <button
                            className="btn-filter-clear w-100"
                            onClick={clearFilters}
                          >
                            <i className="bi bi-eraser me-2"></i> Limpar Filtros
                          </button>
                        </Col>
                      </>
                    ) : null}
                  </Row>
                </div>
              )}

              <div
                className={`tab-wrapper position-relative ${loading ? "is-loading" : ""}`}
              >
                {loading && (
                  <div
                    className="loading-overlay"
                    style={{
                      background: "rgba(0,0,0,0.4)",
                      borderRadius: "12px",
                    }}
                  >
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div
                  className="content-card"
                  style={{
                    background: "var(--card-bg)",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {activeTab === "users" &&
                    (role === "admin" ? (
                      <UserTable
                        users={users}
                        onViewDetail={handleViewDetail}
                      />
                    ) : (
                      <WelcomeOperacional user={currentUser} />
                    ))}

                  {activeTab === "audit" && role === "admin" && (
                    <AuditTable logs={auditLogs} />
                  )}

                  {activeTab === "groups" &&
                    (showGroupForm ? (
                      <GroupForm
                        onSave={handleCreateGroup}
                        onCancel={() => setShowGroupForm(false)}
                        loading={actionLoading}
                      />
                    ) : (
                      <GroupTable
                        groups={groups}
                        onViewDetail={(id) => setSelectedGroupId(id)}
                        onDeleteGroup={handleDeleteGroup}
                        currentUser={currentUser}
                      />
                    ))}
                </div>

                {role === "admin" &&
                  !showGroupForm &&
                  !selectedGroupId &&
                  paginationData?.last > 1 && (
                    <div
                      className="d-flex justify-content-between align-items-center mt-4 p-3 rounded"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      <span className="small text-dim">
                        Exibindo página {currentPage} de {paginationData.last}
                      </span>
                      <Pagination className="mb-0 custom-pagination">
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        />
                        {renderPaginationItems()}
                        <Pagination.Next
                          disabled={currentPage === paginationData.last}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
              </div>
            </>
          )}
        </main>

        {currentUser && currentUser.profile_completed === false && (
          <div
            className="alert-complete-profile m-4 p-4 d-flex align-items-center justify-content-between animate-in"
            style={{
              background: "#fff3cd",
              borderLeft: "5px solid #ffc107",
              borderRadius: "8px",
              color: "#856404",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex align-items-center">
              <i
                className="bi bi-exclamation-triangle-fill me-3"
                style={{ fontSize: "1.5rem" }}
              ></i>
              <div>
                <h6 className="mb-0 fw-bold">
                  Seu perfil ainda não está completo!
                </h6>
                <small>
                  Complete suas informações para liberar todas as
                  funcionalidades.
                </small>
              </div>
            </div>
            <button
              className="btn btn-warning btn-sm fw-bold px-4"
              onClick={() => navigate("/complete-profile")}
              style={{ borderRadius: "20px" }}
            >
              Completar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
