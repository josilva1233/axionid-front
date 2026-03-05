import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users'); // users, audit
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
  }, [navigate]);

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
  }, [activeTab]);

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
        <div className="sidebar-brand">
          <h1>Axion<span>ID</span></h1>
        </div>
        
        <nav className="sidebar-nav">
          <p className="nav-section-title">Principal</p>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span> Gestão Usuários
          </button>

          {role === 'admin' && (
            <>
              <p className="nav-section-title">Segurança</p>
              <button 
                className={`nav-item ${activeTab === 'logins' ? 'active' : ''}`}
                onClick={() => setActiveTab('logins')}
              >
                <span className="nav-icon">🔑</span> Logins Ativos
              </button>
              <button 
                className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveTab('audit')}
              >
                <span className="nav-icon">📜</span> Histórico Logins
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
            <h2>{activeTab === 'users' ? 'Gestão de Usuários' : activeTab === 'audit' ? 'Histórico de Auditoria' : 'Logins'}</h2>
          </div>
          <div className="header-user">
            <span className="user-name">{currentUser?.name}</span>
            <div className="nav-avatar">{currentUser?.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="content-area">
          {loading ? (
            <div className="loading-state">Processando requisição...</div>
          ) : (
            <>
              {/* TELA: GESTÃO DE USUÁRIOS */}
              {activeTab === 'users' && (
                <div className="table-card animate-in">
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
                          <td>#{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.is_admin ? 'Admin' : 'User'}</td>
                          <td>
                             <span className={`badge ${u.is_active ? 'success' : 'danger'}`}>
                               {u.is_active ? 'Ativo' : 'Bloqueado'}
                             </span>
                          </td>
                          <td><button className="btn-small">Editar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TELA: HISTÓRICO DE LOGINS (AUDIT LOGS) */}
              {activeTab === 'audit' && (
                <div className="table-card animate-in">
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
                          <td className="url-cell">{log.url}</td>
                          <td className="mono-text">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}