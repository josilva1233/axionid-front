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
import GroupDetail from "../components/dashboard/GroupDetail"; // Importe o componente novo

// ... Componente WelcomeOperacional mantido ...
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
  const [selectedGroupId, setSelectedGroupId] = useState(null); // Estado para o grupo selecionado
  const [actionLoading, setActionLoading] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    method: "",
    date: "",
  });
  // --- LÓGICA DE CARREGAMENTO (API) ---
  // (loadUsers, loadGroups, loadAuditLogs mantidos exatamente como no seu original)

// No componente pai
const handleDeleteGroup = useCallback(async (groupId) => {
    setActionLoading(true);
    try {
        await api.delete(`/v1/groups/${groupId}`);
        
        // 1. Atualiza a lista local removendo o grupo (Otimização de performance)
        setGroups(prev => prev.filter(g => g.id !== groupId));
        
        // 2. Volta para a lista principal
        setSelectedGroup(null); 
        setView('list'); 
        
        // Mensagem de sucesso (opcional)
        // toast.success("Grupo excluído com sucesso");
    } catch (error) {
        console.error("Erro ao deletar grupo:", error);
        alert("Não foi possível excluir o grupo.");
    } finally {
        setActionLoading(false);
    }
}, [groups]); // Dependência da lista de grupos

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
      if (role !== "admin") return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ page });
        if (filters.method) params.append("method", filters.method);
        if (filters.date) params.append("date", filters.date);
        const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
        setAuditLogs(res.data.data || res.data);
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
    [filters.method, filters.date, role],
  );

  // --- FUNÇÕES DE AÇÃO DO GRUPO (Implementadas para o GroupDetail) ---

  // No seu Dashboard.js corrigido
  const handleAddUserToGroup = async (email) => {
    try {
      // Busca o ID usando a rota que criamos no AuthController
      const userRes = await api.get(
        `/api/v1/users/find-by-email/${encodeURIComponent(email)}`,
      );
      const userId = userRes.data.id;

      // Envia o ID para o seu AxionGroupController@addMember
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, {
        user_id: userId,
      });

      alert("Membro adicionado!");
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

  // --- RESTANTE DAS FUNÇÕES (handleCreateGroup, handleUpdateUser, etc mantidos) ---

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
    // ... lógica de validação de endereço mantida ...
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
    // ... lógica de delete/promote/toggle mantida ...
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

  // --- EFFECTS E RENDER ---

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
          setSelectedGroupId(null); // Resetar ao mudar de aba
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
          {activeTab === "groups" && !showGroupForm && !selectedGroupId && (
            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: "8px", fontSize: "0.8rem" }}
              onClick={() => setShowGroupForm(true)}
            >
              + Novo Grupo
            </button>
          )}
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
              actionLoading={actionLoading}
            />
          ) : (
            <>
              {role === "admin" && activeTab !== "groups" && (
                <div className="filter-card mb-4 p-4 animate-in">
                  <Row className="align-items-end g-3">
                    {activeTab === "users" ? (
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
                      </>
                    ) : (
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
                      </>
                    )}
                    <Col md={3}>
                      <button
                        className="btn-filter-clear w-100"
                        onClick={clearFilters}
                      >
                        <i className="bi bi-eraser me-2"></i> Limpar Filtros
                      </button>
                    </Col>
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
                  {/* Procure por esta linha no seu Dashboard.js e altere para: */}
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
                        currentUser={currentUser} // <-- ADICIONE ISSO AQUI
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
                  funcionalidades do sistema AxionID.
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
