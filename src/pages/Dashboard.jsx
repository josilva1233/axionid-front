import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';

// Importações de componentes externos
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

// --- Sub-componente: Welcome ---
const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4"><span style={{ fontSize: '3rem' }}>👋</span></div>
    <h2 className="text-white mb-2">Bem-vindo, {user?.name || 'Usuário'}!</h2>
    <p className="text-dim">Você está no painel operacional da <strong>AxionID</strong>.</p>
  </div>
);

// --- Sub-componente: Sidebar ---
const Sidebar = ({ activeTab, setActiveTab, role, onLogout }) => (
  <aside className="sidebar">
    <div className="sidebar-brand">
      <div className="brand"><h1>Axion<span>ID</span></h1></div>
    </div>
    <nav className="sidebar-nav">
      <p className="nav-section-title">Principal</p>
      <button 
        className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
        onClick={() => setActiveTab('users')}
      >
        <span className="nav-icon">👥</span> <span>Gestão Usuários</span>
      </button>

      {role === 'admin' && (
        <>
          <p className="nav-section-title">Segurança</p>
          <button 
            className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <span className="nav-icon">📜</span> <span>Histórico Auditoria</span>
          </button>
        </>
      )}
    </nav>
    <div className="sidebar-footer">
      <button onClick={onLogout} className="btn-logout-sidebar">Sair do Sistema</button>
    </div>
  </aside>
);

// --- Componente Principal ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users');
  
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ method: '', date: '' });

  // 1. Carregamento de Dados (Memoizado)
  const loadData = useCallback(async (page = 1) => {
    if (role !== 'admin') return;
    
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/v1/users' : '/api/v1/audit-logs';
      const params = new URLSearchParams({ page: page.toString() });
      
      if (activeTab === 'audit') {
        if (filters.method) params.append('method', filters.method);
        if (filters.date) params.append('date', filters.date);
      }

      const res = await api.get(`${endpoint}?${params.toString()}`);
      const { data: resultData } = res;

      if (activeTab === 'users') {
        setUsers(resultData.data || []);
      } else {
        setAuditLogs(resultData.data || []);
      }

      setPaginationData({
        current: resultData.current_page || 1,
        last: resultData.last_page || 1,
        total: resultData.total || 0
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters.method, filters.date, role]);

  // 2. Carregar Perfil ao montar
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
      } catch (err) { 
        navigate('/login'); 
      }
    };
    loadProfile();
  }, [navigate]);

  // 3. Resetar página e recarregar quando trocar de Aba
  useEffect(() => {
    setCurrentPage(1);
    loadData(1);
  }, [activeTab, loadData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadData(newPage);
  };

  const handleLogout = async () => {
    try { 
      await api.post('/api/v1/logout'); 
    } finally { 
      localStorage.clear(); 
      navigate('/login'); 
    }
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">
            {activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}
          </h2>
          <div className="user-menu-wrapper">
            <div className="nav-avatar-circle">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="content-area p-4">
          {/* Filtros de Auditoria */}
          {activeTab === 'audit' && role === 'admin' && (
            <div className="filter-card mb-4 p-3 bg-dark rounded border border-secondary">
              <Row className="align-items-end g-3">
                <Col md={4}>
                  <Form.Label className="text-white">Método HTTP</Form.Label>
                  <Form.Select 
                    value={filters.method} 
                    onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="">Todos</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <button className="btn-primary w-100" onClick={() => loadData(1)}>
                    Filtrar Resultados
                  </button>
                </Col>
              </Row>
            </div>
          )}

          <div className={`tab-wrapper ${loading ? 'is-loading' : ''}`} style={{ position: 'relative' }}>
            {loading && <div className="loading-overlay">Sincronizando...</div>}
            
            <div className="content-card">
              {activeTab === 'users' ? (
                role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
              ) : (
                role === 'admin' && <AuditTable logs={auditLogs} />
              )}
            </div>

            {/* Paginação Centralizada */}
            {role === 'admin' && paginationData?.last > 1 && (
              <div className="pagination-wrapper mt-4 d-flex justify-content-between align-items-center">
                <button 
                  className="btn-outline-light"
                  disabled={currentPage === 1 || loading} 
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </button>
                <span className="text-white">Página {currentPage} de {paginationData.last}</span>
                <button 
                  className="btn-outline-light"
                  disabled={currentPage === paginationData.last || loading} 
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}