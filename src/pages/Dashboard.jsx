import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Pagination, Form, Row, Col, Button } from "react-bootstrap";
import api from "../services/api";

import Sidebar from "../components/dashboard/Sidebar";
import UserTable from "../components/dashboard/UserTable";
import AuditTable from "../components/dashboard/AuditTable";
import UserDropdown from "../components/dashboard/UserProfile";

// --- COMPONENTES INTERNOS (Para evitar múltiplos arquivos)_ ----

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

const ProfileView = ({ user }) => (
  <div className="detail-grid animate-in">
    <div className="info-card bg-dark p-4 rounded-3 border border-secondary">
      <div className="profile-header d-flex align-items-center gap-3 mb-4">
        <div className="avatar-large bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="mb-0 text-white">{user?.name}</h3>
          <span className="user-role text-primary text-uppercase small fw-bold">{user?.role}</span>
        </div>
      </div>

      <div className="info-list">
        <div className="info-item mb-3">
          <label className="text-dim d-block small mb-1">E-mail Corporativo</label>
          <span className="text-white fs-5">{user?.email}</span>
        </div>
        <div className="info-item mb-3">
          <label className="text-dim d-block small mb-1">Status da Conta</label>
          <span className="badge bg-success">Ativo</span>
        </div>
        <div className="info-item mb-3">
          <label className="text-dim d-block small mb-1">Membro desde</label>
          <span className="text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '---'}</span>
        </div>
      </div>
      
      <hr className="border-secondary my-4" />
      <h5 className="text-white mb-3">Segurança</h5>
      <Button variant="outline-primary" size="sm" disabled>Alterar Senha</Button>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("@AxionID:role"));
  const [activeTab, setActiveTab] = useState("users"); // 'users', 'audit', ou 'profile'

  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  const [filters, setFilters] = useState({ method: "", date: "" });

  // Carregar Usuários
  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users?page=${page}`);
      const data = res.data.data || res.data;
      setUsers(Array.isArray(data) ? data : []);
      
      if (res.data.current_page) {
        setPaginationData({
          current: res.data.current_page,
          last: res.data.last_page,
          total: res.data.total,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Carregar Logs
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);

      const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.data || res.data);
      
      if (res.data.current_page) {
        setPaginationData({
          current: res.data.current_page,
          last: res.data.last_page,
          total: res.data.total,
        });
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, role]);

  // Perfil do usuário logado
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/v1/me");
        setCurrentUser(res.data);
      } catch (err) {
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  // Trigger de carregamento de dados
  useEffect(() => {
    if (role === "admin" && activeTab !== "profile") {
      setCurrentPage(1);
      activeTab === "users" ? loadUsers(1) : loadAuditLogs(1);
    }
  }, [activeTab, role, loadUsers, loadAuditLogs]);

  const handlePageChange = (newPage) => {
    if (!paginationData || newPage === currentPage) return;
    setCurrentPage(newPage);
    activeTab === "users" ? loadUsers(newPage) : loadAuditLogs(newPage);
  };

  const handleLogout = async () => {
    try { await api.post("/api/v1/logout"); } 
    finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setPaginationData(null);
        }}
        role={role}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0 text-white">
            {activeTab === "users" ? "Gestão de Usuários" : 
             activeTab === "audit" ? "Auditoria de Logs" : "Meu Perfil"}
          </h2>

          {currentUser && (
            <UserDropdown 
              user={currentUser} 
              onLogout={handleLogout} 
              onProfileClick={() => setActiveTab("profile")} // Callback para trocar aba
            />
          )}
        </header>

        <main className="content-area p-4">
          {/* Filtros para Auditoria */}
          {activeTab === "audit" && role === "admin" && (
            <div className="filter-card mb-4 p-3 bg-dark rounded border border-secondary">
              <Row className="align-items-end g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-white small">Método HTTP</Form.Label>
                    <Form.Select 
                      className="bg-dark text-white border-secondary"
                      value={filters.method}
                      onChange={(e) => setFilters({...filters, method: e.target.value})}
                    >
                      <option value="">Todos</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="text-white small">Data</Form.Label>
                    <Form.Control 
                      type="date" 
                      className="bg-dark text-white border-secondary"
                      value={filters.date}
                      onChange={(e) => setFilters({...filters, date: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex gap-2">
                  <Button className="w-100" onClick={() => loadAuditLogs(1)}>Filtrar</Button>
                  <Button variant="outline-light" onClick={() => setFilters({method:"", date:""})}>Limpar</Button>
                </Col>
              </Row>
            </div>
          )}

          <div className={`tab-wrapper ${loading ? "is-loading" : ""}`}>
            {loading && <div className="text-primary mb-3">Carregando dados...</div>}

            <div className="content-card">
              {activeTab === "profile" ? (
                <ProfileView user={currentUser} />
              ) : activeTab === "users" ? (
                role === "admin" ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
              ) : (
                role === "admin" && <AuditTable logs={auditLogs} />
              )}
            </div>
            {/* Paginação */}
            {activeTab !== "profile" && role === "admin" && paginationData && paginationData.last > 1 && (
              <div className="mt-4 d-flex justify-content-between align-items-center">
                <span className="text-dim small">Página {currentPage} de {paginationData.last}</span>
                <Pagination size="sm">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                  <Pagination.Next disabled={currentPage === paginationData.last} onClick={() => handlePageChange(currentPage + 1)} />
                </Pagination>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}