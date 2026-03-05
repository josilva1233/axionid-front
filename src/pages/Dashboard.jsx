import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('@AxionID:token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/api/v1/me');
        setCurrentUser(profileRes.data);
        
        if (role === 'admin') {
          loadUsers();
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [navigate, role]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/users');
      setUsers(res.data.data || res.data);
    } finally { setLoading(false); }
  };

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/audit-logs');
      setAuditLogs(res.data.data || res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'audit' && role === 'admin') loadAuditLogs();
    if (activeTab === 'users' && role === 'admin') loadUsers();
  }, [activeTab, role]);

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally {
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
          <h1>Axion<span>ID</span></h1>
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
           <button onClick={handleLogout} className="btn-logout-sidebar">
             Sair do Sistema
           </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="main-header">
          <div className="header-info">
            <h2>
              {activeTab === 'users' ? 'Gestão de Usuários' : 'Histórico de Auditoria'}
            </h2>
          </div>
          <div className="header-user">
            <div className="user-info-min" style={{textAlign: 'right', marginRight: '12px'}}>
              <strong>{currentUser?.name}</strong>
              <span>{role === 'admin' ? 'Administrador' : 'Operacional'}</span>
            </div>
            <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="content-area">
          {/* ALERTA DE PERFIL INCOMPLETO */}
          {currentUser && (!currentUser.profile_completed || !currentUser.cpf_cnpj) && (
            <div className="profile-sidebar-alert animate-in">
              <strong>⚠️ Ação Requerida:</strong> Olá {currentUser.name}, finalize seu cadastro para validar sua identidade digital.
              <button onClick={() => navigate('/complete-profile')} className="btn-small" style={{marginLeft: '15px', background: 'var(--primary)', color: '#fff'}}>
                Completar agora →
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">Processando requisição...</div>
          ) : (
            <div className="animate-in">
              {/* TELA: GESTÃO DE USUÁRIOS */}
              {activeTab === 'users' && (
                role === 'admin' ? (
                  <div className="table-card">
                    <table className="axion-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>E-mail</th>
                          <th>Acesso</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td className="mono-text">#{u.id}</td>
                            <td><strong>{u.name}</strong></td>
                            <td>{u.email}</td>
                            <td>{u.is_admin ? 'Admin' : 'User'}</td>
                            <td>
                               <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                                 {u.is_active ? 'Ativo' : 'Bloqueado'}
                               </span>
                            </td>
                            <td>
                              <button className="btn-small" onClick={() => navigate(`/dashboard/user/${u.id}`)}>Detalhes</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="table-card" style={{padding: '40px', textAlign: 'center'}}>
                    <h3>Bem-vindo à Área Operacional</h3>
                    <p style={{color: 'var(--text-dim)', marginTop: '10px'}}>
                      Você está logado como <strong>{currentUser?.email}</strong>.
                    </p>
                  </div>
                )
              )}

              {/* TELA: HISTÓRICO DE AUDITORIA */}
              {activeTab === 'audit' && role === 'admin' && (
                <div className="table-card">
                  <table className="axion-table">
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Usuário</th>
                        <th>Método</th>
                        <th>URL</th>
                        <th>Endereço IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.log_id}>
                          <td className="mono-text">{new Date(log.executed_at).toLocaleString()}</td>
                          <td>
                            <div className="user-info-min">
                              <strong>{log.user_name || 'Sistema'}</strong>
                              <span>{log.user_email}</span>
                            </div>
                          </td>
                          <td><span className={`method-badge ${log.method}`}>{log.method}</span></td>
                          <td className="url-cell" title={log.url}>{log.url}</td>
                          <td className="mono-text">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}