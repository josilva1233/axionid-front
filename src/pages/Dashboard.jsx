import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Pagination, Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';

import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4"><span style={{fontSize: '3rem'}}>👋</span></div>
    <h2 className="text-white mb-2">Bem-vindo, {user?.name || 'Usuário'}!</h2>
    <p className="text-dim">Você está no painel operacional da <strong>AxionID</strong>.</p>
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

  const [filters, setFilters] = useState({ method: '', date: '' });

  const loadData = useCallback(async (page = 1) => {
    if (role !== 'admin') return;
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/v1/users' : '/api/v1/audit-logs';
      const params = new URLSearchParams({ page });
      if (activeTab === 'audit') {
        if (filters.method) params.append('method', filters.method);
        if (filters.date) params.append('date', filters.date);
      }

      const res = await api.get(`${endpoint}?${params.toString()}`);
      const data = res.data;

      if (activeTab === 'users') {
        setUsers(data.data || []);
      } else {
        setAuditLogs(data.data || []);
      }

      setPaginationData({
        current: data.current_page || 1,
        last: data.last_page || 1,
        total: data.total || 0
      });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, role]);

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
    loadData(1);
    setCurrentPage(1);
  }, [activeTab, loadData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadData(newPage);
  };

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} onLogout={handleLogout} />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
          <div className="user-menu-wrapper">
             <div className="nav-avatar-circle">{currentUser?.name?.charAt(0).toUpperCase()}</div>
             {/* Dropdown simplificado para brevidade */}
          </div>
        </header>

        <main className="content-area p-4">
          {activeTab === 'audit' && role === 'admin' && (
            <div className="filter-card mb-4 p-3 bg-dark rounded border border-secondary">
              <Row className="align-items-end g-3">
                <Col md={4}>
                  <Form.Label className="text-white">Método HTTP</Form.Label>
                  <Form.Select 
                    value={filters.method} 
                    onChange={(e) => setFilters({...filters, method: e.target.value})}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="">Todos</option>
                    <option value="GET">GET</option><option value="POST">POST</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                   <button className="btn-primary w-100" onClick={() => loadData(1)}>Filtrar</button>
                </Col>
              </Row>
            </div>
          )}

          <div className={`tab-wrapper ${loading ? 'is-loading' : ''}`} style={{position: 'relative'}}>
            {loading && <div className="loading-overlay">Carregando...</div>}
            
            <div className="content-card">
              {activeTab === 'users' ? (
                role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
              ) : (
                role === 'admin' && <AuditTable logs={auditLogs} />
              )}
            </div>

            {role === 'admin' && paginationData?.last > 1 && (
              <div className="pagination-wrapper mt-4 d-flex justify-content-between">
                <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>Anterior</button>
                <span className="text-white">Página {currentPage} de {paginationData.last}</span>
                <button disabled={currentPage === paginationData.last} onClick={() => handlePageChange(currentPage + 1)}>Próxima</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}