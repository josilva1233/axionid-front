import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Spinner, Pagination } from 'react-bootstrap';
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

  // Memoizando as funções de carga para evitar re-renderizações desnecessárias
  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users?page=${page}`);
      if (res.data.current_page) {
        setUsers(res.data.data);
        setPaginationData({
          current: res.data.current_page,
          last: res.data.last_page,
          total: res.data.total
        });
      } else {
        setUsers(res.data.data || res.data);
        setPaginationData(null);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/audit-logs?page=${page}`);
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
  }, []);

  // CARGA INICIAL
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
        if (role === 'admin') {
          activeTab === 'users' ? await loadUsers(1) : await loadAuditLogs(1);
        }
      } catch (err) { 
        navigate('/login'); 
      } finally { 
        setLoading(false); 
      }
    };
    loadInitialData();
  }, [role, navigate, activeTab, loadUsers, loadAuditLogs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationData?.last || newPage === currentPage) return;
    setCurrentPage(newPage);
    activeTab === 'users' ? loadUsers(newPage) : loadAuditLogs(newPage);
  };

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  // Lógica para não explodir a quantidade de botões na tela
  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(paginationData.last, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
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
           <h2>{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
           <div className="header-user">
             <div className="text-end me-3 d-none d-sm-block">
               <strong className="d-block">{currentUser?.name}</strong>
               <small className="text-primary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>{role}</small>
             </div>
             <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
           </div>
        </header>

        <main className="content-area">
          {currentUser && !currentUser.profile_completed && (
            <div className="profile-sidebar-alert d-flex justify-content-between align-items-center mb-4">
              <span>⚠️ <strong>Ação necessária:</strong> Finalize seu cadastro.</span>
              <button className="btn btn-sm btn-warning fw-bold" onClick={() => navigate('/complete-profile')}>Completar</button>
            </div>
          )}

          <div className="tab-wrapper position-relative" style={{ minHeight: '500px' }}>
            {/* Overlay de loading para não quebrar o layout durante o fetch */}
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
            
            {role === 'admin' && paginationData && paginationData.last > 1 && (
              <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-10">
                <span className="small text-secondary mb-2 mb-md-0">
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

function WelcomeOperacional({ user }) {
  return (
    <div className="table-card shadow-lg border border-secondary border-opacity-10 p-5 text-center">
      <h3 className="fw-bold">Área do Cliente AxionID</h3>
      <p className="text-secondary mt-3">
        Seja bem-vindo. Sua conta está ativa sob o identificador:<br/>
        <strong className="text-white">{user?.email || user?.cpf_cnpj}</strong>
      </p>
    </div>
  );
}