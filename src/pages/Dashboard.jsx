import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Pagination, Form, Row, Col, Button } from 'react-bootstrap';
import api from '../services/api';

import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

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

  // --- NOVOS ESTADOS PARA FILTROS ---
  const [filters, setFilters] = useState({
    method: '',
    date: ''
  });

  const loadUsers = useCallback(async (page = 1) => {
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
  }, []);

  // --- ATUALIZADO: Carregar Logs com filtros ---
  const loadAuditLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Constrói os parâmetros dinamicamente
      const params = new URLSearchParams({ page });
      if (filters.method) params.append('method', filters.method);
      if (filters.date) params.append('date', filters.date);

      const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
      
      if (res.data.current_page) {
        setAuditLogs(res.data.data);
        setPaginationData({
          current: res.data.current_page,
          last: res.data.last_page,
          total: res.data.total
        });
      } else {
        setAuditLogs(res.data.data || res.data);
        setPaginationData(null);
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Recria a função se os filtros mudarem

  // CARGA INICIAL (Perfil)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
      } catch (err) { navigate('/login'); }
    };
    loadProfile();
  }, [navigate]);

  // Efeito para troca de aba ou filtros
  useEffect(() => {
    if (role !== 'admin') return;
    setCurrentPage(1);
    activeTab === 'users' ? loadUsers(1) : loadAuditLogs(1);
  }, [activeTab, role, loadUsers, loadAuditLogs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationData?.last || newPage === currentPage) return;
    setCurrentPage(newPage);
    activeTab === 'users' ? loadUsers(newPage) : loadAuditLogs(newPage);
  };

  // HANDLER PARA FILTROS
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
<header className="main-header d-flex justify-content-between align-items-center p-3">
  <h2>{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>

  {currentUser && (
    <div className="user-menu-container">
      <div className="dropdown">
        <button 
          className="btn d-flex align-items-center justify-content-center p-0"
          type="button"
          id="userMenuButton"
          data-bs-toggle="dropdown" 
          aria-expanded="false"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#4A90E2', // Cor de fundo do círculo
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            border: 'none',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Pega a primeira letra do nome */}
          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
        </button>

        <ul className="dropdown-menu dropdown-menu-end shadow border-secondary bg-dark" aria-labelledby="userMenuButton">
          <li className="px-3 py-2 border-bottom border-secondary mb-2">
            <div className="small text-secondary">Logado como:</div>
            <div className="text-white fw-bold">{currentUser.name}</div>
            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>{currentUser.email}</div>
          </li>
          <li>
            <button className="dropdown-item text-white py-2" onClick={() => navigate('/perfil')}>
              <i className="bi bi-person me-2"></i> Meus Detalhes
            </button>
          </li>
          <li>
            <hr className="dropdown-divider border-secondary" />
          </li>
          <li>
            <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Sair
            </button>
          </li>
        </ul>
      </div>
    </div>
  )}
</header>

        <main className="content-area">
          {/* BARRA DE FILTROS (Apenas para Auditoria) */}
          {activeTab === 'audit' && role === 'admin' && (
            <div className="filter-card bg-dark bg-opacity-25 p-3 rounded-3 mb-4 border border-secondary border-opacity-10">
              <Row className="align-items-end g-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small text-secondary">Método HTTP</Form.Label>
                    <Form.Select 
                      name="method" 
                      value={filters.method} 
                      onChange={handleFilterChange}
                      className="bg-dark text-white border-secondary"
                    >
                      <option value="">Todos os métodos</option>
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small text-secondary">Data do Log</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="date" 
                      value={filters.date} 
                      onChange={handleFilterChange}
                      className="bg-dark text-white border-secondary"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex gap-2">
                  <Button variant="primary" className="w-100" onClick={() => loadAuditLogs(1)}>
                    Filtrar
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Limpar
                  </Button>
                </Col>
              </Row>
            </div>
          )}

          <div className="tab-wrapper position-relative" style={{ minHeight: '500px' }}>
            {loading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-10" style={{ zIndex: 5 }}>
                <Spinner animation="border" variant="primary" />
              </div>
            )}

            <div className={loading ? 'opacity-25' : 'opacity-100'} style={{ transition: 'opacity 0.2s' }}>
              {activeTab === 'users' && (
                role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
              )}
              
              {activeTab === 'audit' && role === 'admin' && (
                <AuditTable logs={auditLogs} />
              )}
            </div>
            
            {/* Paginação ... */}
            {role === 'admin' && paginationData && paginationData.last > 1 && (
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-10">
                <span className="small text-secondary">
                  Página <strong>{currentPage}</strong> de {paginationData.last} ({paginationData.total} registros)
                </span>
                <Pagination className="mb-0 shadow-sm">
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