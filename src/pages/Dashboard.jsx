import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Pagination, Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';

import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';
import UserDropdown from '../components/dashboard/UserDropdown';

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
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users');
  
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  const [filters, setFilters] = useState({
    method: '',
    date: ''
  });

  const loadUsers = useCallback(async (page = 1) => {
    if (role !== 'admin') return;
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users?page=${page}`);
      if (res.data.current_page) {
        setUsers(res.data.data);
        setPaginationData({ current: res.data.current_page, last: res.data.last_page, total: res.data.total });
      } else {
        setUsers(res.data.data || res.data);
        setPaginationData(null);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [role]);

  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== 'admin') return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.method) params.append('method', filters.method);
      if (filters.date) params.append('date', filters.date);

      const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
      if (res.data.current_page) {
        setAuditLogs(res.data.data);
        setPaginationData({ current: res.data.current_page, last: res.data.last_page, total: res.data.total });
      } else {
        setAuditLogs(res.data.data || res.data);
        setPaginationData(null);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [filters, role]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
      } catch (err) { navigate('/login'); }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (role === 'admin') {
      setCurrentPage(1);
      activeTab === 'users' ? loadUsers(1) : loadAuditLogs(1);
    }
  }, [activeTab, role, loadUsers, loadAuditLogs]);

  const handlePageChange = (newPage) => {
    if (!paginationData || newPage < 1 || newPage > paginationData?.last || newPage === currentPage) return;
    setCurrentPage(newPage);
    activeTab === 'users' ? loadUsers(newPage) : loadAuditLogs(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ method: '', date: '' });
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  const renderPaginationItems = () => {
    if (!paginationData) return null;
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(paginationData.last, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setCurrentPage(1); }} role={role} onLogout={handleLogout} />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {/* ALERTA DE PERFIL INCOMPLETO */}
{currentUser && !currentUser.profile_completed && (
  <div className="alert-complete-profile animate-in">
    <div className="alert-content">
      <div className="alert-icon">⚠️</div>
      <div>
        <h6>Seu cadastro está incompleto!</h6>
        <p>Finalize as etapas restantes para garantir a segurança da sua conta.</p>
      </div>
    </div>
    <button className="btn-complete" onClick={() => navigate('/complete-profile')}>
      Finalizar Agora
    </button>
  </div>
)}
{/* Filtros para Auditoria */}
{activeTab === 'audit' && role === 'admin' && (
  <div className="filter-card mb-4 p-3" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
    <Row className="align-items-end g-3">
      {/* Método HTTP */}
      <Col md={3}>
        <Form.Group>
          <Form.Label className="text-uppercase fw-bold mb-2" style={{ color: '#6c757d', fontSize: '0.7rem', letterSpacing: '1px' }}>
            Método HTTP
          </Form.Label>
          <Form.Select 
            name="method" 
            value={filters.method} 
            onChange={handleFilterChange} 
            className="custom-input-dark"
          >
            <option value="">Todos</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Data */}
      <Col md={3}>
        <Form.Group>
          <Form.Label className="text-uppercase fw-bold mb-2" style={{ color: '#6c757d', fontSize: '0.7rem', letterSpacing: '1px' }}>
            Data
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

      {/* Botões de Ação */}
      <Col md={6} className="d-flex gap-2">
        <button 
          className="btn-action-primary flex-grow-1" 
          onClick={() => loadAuditLogs(1)}
        >
          <i className="bi bi-funnel me-2"></i> FILTRAR
        </button>
        <button 
          className="btn-action-outline px-4" 
          onClick={clearFilters}
        >
          Limpar
        </button>
      </Col>
    </Row>
  </div>
)}
          <div className={`tab-wrapper position-relative ${loading ? 'is-loading' : ''}`}>
            {loading && (
              <div className="loading-overlay">
                <Spinner animation="border" variant="primary" />
                <span className="ms-3 text-primary fw-bold">Carregando...</span>
              </div>
            )}

            <div className="content-card">
              {activeTab === 'users' ? (
                role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
              ) : (
                role === 'admin' && <AuditTable logs={auditLogs} />
              )}
            </div>
            
            {role === 'admin' && paginationData && paginationData.last > 1 && (
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 p-3 rounded-3 bg-dark bg-opacity-25 border border-secondary border-opacity-10">
                <span className="small text-dim">
                  Página <strong>{currentPage}</strong> de {paginationData.last}
                </span>
                <Pagination className="mb-0">
                  <Pagination.First disabled={currentPage === 1} onClick={() => handlePageChange(1)} />
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                  {renderPaginationItems()}
                  <Pagination.Next disabled={currentPage === paginationData.last} onClick={() => handlePageChange(currentPage + 1)} />
                  <Pagination.Last disabled={currentPage === paginationData.last} onClick={() => handlePageChange(paginationData.last)} />
                </Pagination>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}