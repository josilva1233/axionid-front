import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';

import Sidebar from '../components/dashboard/Sidebar'; 
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4"><span style={{ fontSize: '3rem' }}>👋</span></div>
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
  const [paginationData, setPaginationData] = useState({ current: 1, last: 1 });
  const [filters, setFilters] = useState({ method: '', date: '' });

  const loadData = useCallback(async (page = 1) => {
    if (role !== 'admin' && activeTab === 'audit') return;
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/v1/users' : '/api/v1/audit-logs';
      const params = new URLSearchParams({ page: page.toString() });
      if (activeTab === 'audit' && filters.method) params.append('method', filters.method);

      const res = await api.get(`${endpoint}?${params.toString()}`);
      if (activeTab === 'users') setUsers(res.data.data || []);
      else setAuditLogs(res.data.data || []);

      setPaginationData({
        current: res.data.current_page || 1,
        last: res.data.last_page || 1
      });
      setCurrentPage(page);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [activeTab, filters.method, role]);

  useEffect(() => {
    api.get('/api/v1/me').then(res => setCurrentUser(res.data)).catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => { loadData(1); }, [activeTab, loadData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} onLogout={handleLogout} />
      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
          <div className="nav-avatar-circle">{currentUser?.name?.charAt(0) || 'U'}</div>
        </header>
        <main className="content-area p-4">
          {activeTab === 'audit' && role === 'admin' && (
            <div className="filter-card mb-4 p-3 bg-dark rounded border">
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Select value={filters.method} onChange={(e) => setFilters({...filters, method: e.target.value})}>
                    <option value="">Todos os Métodos</option>
                    <option value="GET">GET</option><option value="POST">POST</option>
                  </Form.Select>
                </Col>
                <Col md={4}><button className="btn-primary" onClick={() => loadData(1)}>Filtrar</button></Col>
              </Row>
            </div>
          )}
          <div className="content-card">
            {loading ? <p>Carregando...</p> : (
              activeTab === 'users' ? (role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />) : <AuditTable logs={auditLogs} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}