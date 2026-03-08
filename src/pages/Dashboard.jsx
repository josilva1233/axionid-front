import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner, Pagination, Form, Row, Col } from "react-bootstrap";
import api from "../services/api";

import Sidebar from "../components/dashboard/Sidebar";
import UserTable from "../components/dashboard/UserTable";
import AuditTable from "../components/dashboard/AuditTable";
import UserDropdown from "../components/dashboard/UserDropdown";
import UserDetail from "../components/dashboard/UserDetail";

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4">
      <div className="display-4 text-primary">👋</div>
    </div>
    <h2 className="text-white mb-2">Bem-vindo, {user?.name}!</h2>
    <p className="text-dim">
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
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  // Estados para o Componente UserDetail
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, [role, filters.name, filters.completed]);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.method, filters.date, role]);

  // --- HANDLERS DE FILTRO ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); 
  };

  const clearFilters = () => {
    setFilters({ name: "", method: "", date: "", completed: "" });
    setCurrentPage(1);
  };

  // --- LÓGICA DO USER DETAIL (API) ---

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
      // 1. Ação de Excluir (com validação de nome por segurança)
      if (type === 'delete') {
        const confirmName = window.prompt(`Para excluir permanentemente "${selectedUser.name}", digite o NOME dele abaixo:`);
        if (confirmName !== selectedUser.name) {
          if (confirmName !== null) alert("O nome digitado não confere. Operação cancelada.");
          return;
        }
        await api.delete(`/api/v1/users/${selectedUser.id}`);
        alert("Usuário excluído com sucesso!");
        setSelectedUser(null);
        loadUsers(currentPage); // Recarrega a lista na página atual
        return;
      }

      // 2. Ação de Promover
      if (type === 'promote') {
        if (!window.confirm("Promover este usuário a Administrador?")) return;
        await api.post(`/api/v1/users/${selectedUser.id}/promote`);
      }

      // 3. Ação de Remover Admin (Nova)
      if (type === 'remove-admin') {
        if (!window.confirm("Remover privilégios administrativos deste usuário?")) return;
        await api.post(`/api/v1/users/${selectedUser.id}/remove-admin`);
      }

      // 4. Ação de Alterar Status
      if (type === 'toggle-status') {
        const acao = selectedUser.is_active ? "suspender" : "ativar";
        if (!window.confirm(`Deseja realmente ${acao} este usuário?`)) return;
        await api.patch(`/api/v1/users/${selectedUser.id}/toggle-status`);
      }

      // Após qualquer ação (exceto delete), recarrega os detalhes para atualizar os botões na tela
      handleViewDetail(selectedUser.id);
      loadUsers(currentPage); // Mantém a tabela em background atualizada
      
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao processar requisição.");
    } finally {
      setActionLoading(false);
    }
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
    if (role === "admin") {
      activeTab === "users" ? loadUsers(currentPage) : loadAuditLogs(currentPage);
    }
  }, [activeTab, role, loadUsers, loadAuditLogs, currentPage]);

  const handleLogout = async () => {
    try { await api.post("/api/v1/logout"); } 
    finally { localStorage.clear(); navigate("/login"); }
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
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedUser(null); setCurrentPage(1); }} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">
            {selectedUser ? "Detalhes do Usuário" : (activeTab === "users" ? "Gestão de Usuários" : "Auditoria")}
          </h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail 
              user={selectedUser} 
              onBack={() => setSelectedUser(null)}
              onAction={handleUserAction}
              actionLoading={actionLoading}
            />
          ) : (
            <>
              {/* PESQUISA DE USUÁRIOS */}
              {activeTab === "users" && role === "admin" && (
                <div className="filter-card mb-4 p-3 border-secondary animate-in">
                  <Row className="align-items-end g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-dim small fw-bold text-uppercase">Buscar Usuário</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Nome completo ou parte do nome."
                          value={filters.name}
                          onChange={handleFilterChange}
                          className="custom-input-dark"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="text-dim small fw-bold text-uppercase">Cadastro</Form.Label>
                        <Form.Select name="completed" value={filters.completed} onChange={handleFilterChange} className="custom-input-dark">
                          <option value="">Todos</option>
                          <option value="1">Completo</option>
                          <option value="0">Incompleto</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <button className="btn-action-outline w-100" onClick={clearFilters}>Limpar</button>
                    </Col>
                  </Row>
                </div>
              )}

              {/* PESQUISA DE AUDITORIA */}
              {activeTab === "audit" && role === "admin" && (
                <div className="filter-card mb-4 p-3 border-secondary animate-in">
                  <Row className="align-items-end g-3">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="text-dim small fw-bold text-uppercase">Método</Form.Label>
                        <Form.Select name="method" value={filters.method} onChange={handleFilterChange} className="custom-input-dark">
                          <option value="">Todos</option>
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="text-dim small fw-bold text-uppercase">Data</Form.Label>
                        <Form.Control type="date" name="date" value={filters.date} onChange={handleFilterChange} className="custom-input-dark" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <button className="btn-action-outline px-4" onClick={clearFilters}>Limpar Auditoria</button>
                    </Col>
                  </Row>
                </div>
              )}

              <div className={`tab-wrapper position-relative ${loading ? "is-loading" : ""}`}>
                {loading && <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>}
                
                <div className="content-card">
                  {activeTab === "users" ? (
                    role === "admin" ? <UserTable users={users} onViewDetail={handleViewDetail} /> : <WelcomeOperacional user={currentUser} />
                  ) : (
                    role === "admin" && <AuditTable logs={auditLogs} />
                  )}
                </div>

                {role === "admin" && paginationData && paginationData.last > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4 p-3 bg-dark bg-opacity-25 rounded">
                    <span className="small text-dim">Página {currentPage} de {paginationData.last}</span>
                    <Pagination className="mb-0">
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