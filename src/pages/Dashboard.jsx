import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Spinner, Pagination } from 'react-bootstrap';
import api from '../services/api';

// Importando os novos componentes
import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users');
  
  // Estados de Dados
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  // 1. CARGA INICIAL (Perfil e Dados da primeira aba)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
        
        // Carrega dados iniciais se for admin
        if (role === 'admin') {
          if (activeTab === 'users') await loadUsers(1);
          else await loadAuditLogs(1);
        }
      } catch (err) { 
        console.error("Erro na carga inicial:", err);
        navigate('/login'); 
      } finally { 
        setLoading(false); 
      }
    };
    loadInitialData();
  }, [role, navigate]);

  // 2. FUNÇÃO: Carregar Usuários (Com Paginação)
  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users?page=${page}`);
      
      // Lógica para paginação padrão Laravel
      if (res.data.current_page) {
        setUsers(res.data.data);
        setPaginationData({
          current: res.data.current_page,
          last: res.data.last_page,
          total: res.data.total
        });
      } else {
        setUsers(res.data.data || res.data);
        setPaginationData(null); // Caso a API não retorne paginação
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. FUNÇÃO: Carregar Auditoria (Com Paginação)
  const loadAuditLogs = async (page = 1) => {
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
  };

  // 4. EFEITO: Troca de Abas
  useEffect(() => {
    if (role !== 'admin') return;
    setCurrentPage(1); 
    activeTab === 'users' ? loadUsers(1) : loadAuditLogs(1);
  }, [activeTab, role]);

  // 5. HANDLERS
  const handlePageChange = (newPage) => {
    if (newPage === currentPage) return;
    setCurrentPage(newPage);
    if (activeTab === 'users') loadUsers(newPage);
    else loadAuditLogs(newPage);
  };

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
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
           <h2>{activeTab === 'users' ? 'Gestão de Usuários' : 'Auditoria'}</h2>
           <div className="header-user">
             <div className="text-end me-3 d-none d-sm-block">
               <strong className="d-block">{currentUser?.name}</strong>
               <small className="text-primary fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>
                 {role}
               </small>
             </div>
             <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
           </div>
        </header>

        <main className="content-area">
          {/* Alerta de Perfil Incompleto */}
          {currentUser && !currentUser.profile_completed && (
            <div className="profile-sidebar-alert d-flex justify-content-between align-items-center mb-4">
              <span>⚠️ <strong>Ação necessária:</strong> Finalize seu cadastro para liberar todos os recursos.</span>
              <button className="btn btn-sm btn-warning fw-bold" onClick={() => navigate('/complete-profile')}>
                Completar Perfil
              </button>
            </div>
          )}

          <div className={`tab-wrapper position-relative ${loading ? 'opacity-50' : ''}`} style={{ minHeight: '400px' }}>
            {/* Renderização de Tabelas conforme Aba e Role */}
            {activeTab === 'users' && (
              role === 'admin' ? <UserTable users={users} /> : <WelcomeOperacional user={currentUser} />
            )}
            
            {activeTab === 'audit' && role === 'admin' && (
              <AuditTable logs={auditLogs} />
            )}
            
            {/* Componente de Paginação Bootstrap */}
            {role === 'admin' && paginationData && paginationData.last > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-4 bg-dark bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-10">
                <span className="small text-secondary">
                  Total de <strong>{paginationData.total}</strong> registros
                </span>
                <Pagination className="mb-0">
                  <Pagination.Prev 
                    disabled={currentPage === 1} 
                    onClick={() => handlePageChange(currentPage - 1)} 
                  />
                  {[...Array(paginationData.last)].map((_, i) => (
                    <Pagination.Item 
                      key={i + 1} 
                      active={i + 1 === currentPage}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next 
                    disabled={currentPage === paginationData.last} 
                    onClick={() => handlePageChange(currentPage + 1)} 
                  />
                </Pagination>
              </div>
            )}

            {/* Overlay de Loading Centralizado */}
            {loading && (
              <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ zIndex: 10 }}>
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 small text-primary fw-bold text-uppercase">Sincronizando...</div>
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
      <div className="mt-4 p-3 bg-primary bg-opacity-10 rounded-3 d-inline-block border border-primary border-opacity-25">
        <small className="text-primary fw-bold text-uppercase">Status do Acesso: Operacional</small>
      </div>
    </div>
  );
}