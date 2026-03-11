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
// IMPORTANTE: Importe o componente que vamos usar para gerenciar
import GerenciarGrupo from "../components/dashboard/GerenciarGrupo"; 

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4">
      <div className="display-4" style={{ color: "var(--primary)" }}>👋</div>
    </div>
    <h2 className="text-white mb-2" style={{ fontWeight: "600" }}>
      Bem-vindo, {user?.name}!
    </h2>
    <p className="text-dim mx-auto" style={{ maxWidth: "500px", lineHeight: "1.6" }}>
      Você está logado no painel operacional da <strong>AxionID</strong>.<br />
      Utilize o menu lateral para navegar ou o avatar no topo para ver seu perfil.
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
  // NOVO ESTADO PARA GERENCIAR GRUPO SELECIONADO
  const [selectedGroupId, setSelectedGroupId] = useState(null); 
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    method: "",
    date: "",
  });

  // --- LÓGICA DE CARREGAMENTO ---

  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);
      const res = await api.get(`/api/v1/users?${params.toString()}`);
      setUsers(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [role, filters.name, filters.completed]);

  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      setGroups(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);
      const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [filters.method, filters.date, role]);

  // --- FUNÇÕES DE AÇÃO ---

  const handleCreateGroup = async (formData) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/groups", formData);
      alert("Grupo cadastrado com sucesso!");
      setShowGroupForm(false);
      loadGroups(1);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao cadastrar grupo.");
    } finally { setActionLoading(false); }
  };

  const handleUpdateUser = async (id, formData) => {
    setActionLoading(true);
    try {
      await api.put(`/api/v1/users/${id}/update-manual`, formData);
      alert("Usuário atualizado com sucesso!");
      handleViewDetail(id);
      loadUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao atualizar.");
    } finally { setActionLoading(false); }
  };

  const handleViewDetail = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users/${id}`);
      setSelectedUser(res.data.data);
    } catch (err) { alert("Erro ao buscar detalhes"); } finally { setLoading(false); }
  };

  // ATUALIZADO: Define o ID do grupo para exibir o componente de gerenciamento
  const handleViewDetailGroup = (id) => {
    setSelectedGroupId(id);
  };

  const handleUserAction = async (type) => {
    setActionLoading(true);
    try {
      if (type === "delete") {
        const confirmName = window.prompt(`Para excluir "${selectedUser.name}", digite o NOME dele:`);
        if (confirmName !== selectedUser.name) return;
        await api.delete(`/api/v1/users/${selectedUser.id}`);
        setSelectedUser(null);
        loadUsers(currentPage);
        return;
      }
      if (type === "promote") await api.post(`/api/v1/users/${selectedUser.id}/promote`);
      if (type === "remove-admin") await api.post(`/api/v1/users/${selectedUser.id}/remove-admin`);
      if (type === "toggle-status") await api.patch(`/api/v1/users/${selectedUser.id}/toggle-status`);
      handleViewDetail(selectedUser.id);
      loadUsers(currentPage);
    } catch (err) { alert("Erro ao processar."); } finally { setActionLoading(false); }
  };

  // --- EFFECTS ---

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get("/api/v1/me");
        setCurrentUser(profileRes.data);
      } catch (err) { navigate("/login"); }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
  }, [activeTab, role, loadUsers, loadAuditLogs, loadGroups, currentPage]);

  const handleLogout = async () => {
    try { await api.post("/api/v1/logout"); } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const renderPaginationItems = () => {
    if (!paginationData) return null;
    const items = [];
    for (let i = 1; i <= paginationData.last; i++) {
      if (i === 1 || i === paginationData.last || (i >= currentPage - 2 && i <= currentPage + 2)) {
        items.push(
          <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
            {i}
          </Pagination.Item>
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
          setSelectedGroupId(null); // Reseta ao mudar de aba
          setShowGroupForm(false);
          setCurrentPage(1);
        }}
        role={role}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <header className="main-header" style={{ borderBottom: "1px solid var(--border-color)", padding: "1rem 2rem" }}>
          <div className="d-flex align-items-center gap-3">
            <h2 className="brand" style={{ fontSize: "1.25rem", margin: 0 }}>
              {selectedUser ? "Detalhes do Usuário" : 
               selectedGroupId ? "Gerenciar Membros" :
               activeTab === "users" ? "Gestão de Usuários" : 
               activeTab === "groups" ? "Gestão de Grupos" : "Auditoria"}
            </h2>
            {activeTab === "groups" && !showGroupForm && !selectedGroupId && (
              <button className="btn btn-primary btn-sm" style={{ borderRadius: '8px' }} onClick={() => setShowGroupForm(true)}>
                + Novo Grupo
              </button>
            )}
          </div>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} onAction={handleUserAction} onUpdate={handleUpdateUser} actionLoading={actionLoading} />
          ) : selectedGroupId ? (
            /* COMPONENTE DE GERENCIAMENTO DE GRUPO */
            <GerenciarGrupo 
                groupId={selectedGroupId} 
                onBack={() => {
                    setSelectedGroupId(null);
                    loadGroups(currentPage);
                }} 
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
                            <Form.Label className="filter-label">Buscar por Nome</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Ex: João..." value={filters.name} onChange={handleFilterChange} className="custom-input-dark" />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="filter-label">Status Perfil</Form.Label>
                            <Form.Select name="completed" value={filters.completed} onChange={handleFilterChange} className="custom-input-dark">
                              <option value="">Todos</option>
                              <option value="1">✅ Completo</option>
                              <option value="0">⚠️ Incompleto</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </>
                    ) : (
                      <>
                        <Col md={5}>
                          <Form.Group>
                            <Form.Label className="filter-label">Método HTTP</Form.Label>
                            <Form.Select name="method" value={filters.method} onChange={handleFilterChange} className="custom-input-dark">
                              <option value="">Todos</option>
                              <option value="POST">POST</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label className="filter-label">Data</Form.Label>
                            <Form.Control type="date" name="date" value={filters.date} onChange={handleFilterChange} className="custom-input-dark" />
                          </Form.Group>
                        </Col>
                      </>
                    )}
                    <Col md={3}>
                      <button className="btn-filter-clear w-100" onClick={clearFilters}>Limpar</button>
                    </Col>
                  </Row>
                </div>
              )}

              <div className={`tab-wrapper position-relative ${loading ? "is-loading" : ""}`}>
                {loading && (
                  <div className="loading-overlay" style={{ background: "rgba(0,0,0,0.4)", borderRadius: "12px" }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div className="content-card" style={{ background: "var(--card-bg)", borderRadius: "12px", overflow: "hidden" }}>
                  {activeTab === "users" && (role === "admin" ? <UserTable users={users} onViewDetail={handleViewDetail} /> : <WelcomeOperacional user={currentUser} />)}
                  {activeTab === "audit" && role === "admin" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm onSave={handleCreateGroup} onCancel={() => setShowGroupForm(false)} loading={actionLoading} />
                    ) : (
                      <GroupTable groups={groups} onViewDetail={handleViewDetailGroup} />
                    )
                  )}
                </div>

                {role === "admin" && !showGroupForm && !selectedGroupId && paginationData?.last > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4 p-3 rounded" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="small text-dim">Página {currentPage} de {paginationData.last}</span>
                    <Pagination className="mb-0 custom-pagination">
                      <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} />
                      {renderPaginationItems()}
                      <Pagination.Next disabled={currentPage === paginationData.last} onClick={() => setCurrentPage(currentPage + 1)} />
                    </Pagination>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}