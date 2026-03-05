import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Nav, Table, Button, 
  Badge, Spinner, Alert, Navbar 
} from 'react-bootstrap';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Lógica de Autenticação e Carregamento (Mantida original)
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
        if (role === 'admin') loadUsers();
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
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      
      {/* SIDEBAR - Bootstrap Layout */}
      <aside className="sidebar-fixed d-none d-lg-flex flex-column p-4 text-white shadow" 
             style={{ width: '280px', backgroundColor: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}>
        <div className="mb-5" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <h2 className="fw-bold mb-0">Axion<span className="text-primary">ID</span></h2>
        </div>

        <Nav className="flex-column gap-2 flex-grow-1">
          <small className="text-uppercase fw-bold text-secondary mb-2" style={{ fontSize: '0.7rem' }}>Principal</small>
          <Nav.Link 
            onClick={() => setActiveTab('users')}
            className={`d-flex align-items-center gap-3 p-3 rounded-3 transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow' : 'text-secondary hover-bg'}`}
          >
            👥 <span>Gestão Usuários</span>
          </Nav.Link>

          {role === 'admin' && (
            <>
              <small className="text-uppercase fw-bold text-secondary mt-4 mb-2" style={{ fontSize: '0.7rem' }}>Segurança</small>
              <Nav.Link 
                onClick={() => setActiveTab('audit')}
                className={`d-flex align-items-center gap-3 p-3 rounded-3 transition-all ${activeTab === 'audit' ? 'bg-primary text-white shadow' : 'text-secondary hover-bg'}`}
              >
                📜 <span>Auditoria</span>
              </Nav.Link>
            </>
          )}
        </Nav>

        <Button variant="outline-danger" className="mt-auto border-0 d-flex align-items-center gap-2" onClick={handleLogout}>
           🚪 Sair do Sistema
        </Button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* HEADER */}
        <Navbar className="px-4 py-3 shadow-sm border-bottom border-secondary border-opacity-10 bg-dark bg-opacity-50">
          <h4 className="mb-0 fw-semibold text-white">
            {activeTab === 'users' ? 'Gestão de Usuários' : 'Histórico de Auditoria'}
          </h4>
          <Navbar.Collapse className="justify-content-end">
            <div className="d-flex align-items-center gap-3">
              <div className="text-end d-none d-sm-block">
                <div className="fw-bold text-white small">{currentUser?.name}</div>
                <div className="text-primary fw-bold" style={{ fontSize: '0.7rem' }}>{role?.toUpperCase()}</div>
              </div>
              <div className="bg-primary rounded-3 fw-bold d-flex align-items-center justify-content-center text-white" 
                   style={{ width: '40px', height: '40px' }}>
                {currentUser?.name?.charAt(0)}
              </div>
            </div>
          </Navbar.Collapse>
        </Navbar>

        {/* CONTENT AREA */}
        <main className="p-4 overflow-auto">
          {/* ALERTA DE PERFIL */}
          {currentUser && (!currentUser.profile_completed || !currentUser.cpf_cnpj) && (
            <Alert variant="warning" className="border-0 shadow-sm d-flex justify-content-between align-items-center py-3 px-4 rounded-4 mb-4">
              <div>
                <strong>⚠️ Ação Requerida:</strong> Olá {currentUser.name}, finalize seu cadastro para validar sua identidade digital.
              </div>
              <Button size="sm" variant="warning" className="fw-bold px-3" onClick={() => navigate('/complete-profile')}>
                Completar agora →
              </Button>
            </Alert>
          )}

          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center mt-5 py-5 text-secondary">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <span>Processando requisição...</span>
            </div>
          ) : (
            <div className="animate-in">
              {/* TELA: USUÁRIOS */}
              {activeTab === 'users' && (
                role === 'admin' ? (
                  <div className="glass-card p-0 overflow-hidden shadow">
                    <Table hover responsive variant="dark" className="mb-0 align-middle">
                      <thead className="bg-dark text-secondary small text-uppercase fw-bold">
                        <tr className="border-bottom border-secondary border-opacity-10">
                          <th className="px-4 py-3">ID</th>
                          <th>Nome</th>
                          <th>E-mail</th>
                          <th>Acesso</th>
                          <th>Status</th>
                          <th className="text-end px-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="border-bottom border-secondary border-opacity-10">
                            <td className="px-4 text-secondary small">#{u.id}</td>
                            <td><div className="fw-bold">{u.name}</div></td>
                            <td className="text-secondary">{u.email}</td>
                            <td><Badge bg="secondary" className="bg-opacity-25 text-white fw-medium">{u.is_admin ? 'Admin' : 'User'}</Badge></td>
                            <td>
                               <Badge bg={u.is_active ? 'success' : 'danger'} className="rounded-pill px-3">
                                 {u.is_active ? 'Ativo' : 'Bloqueado'}
                               </Badge>
                            </td>
                            <td className="text-end px-4">
                              <Button variant="outline-primary" size="sm" className="rounded-2 px-3 fw-bold" 
                                      onClick={() => navigate(`/dashboard/user/${u.id}`)}>
                                Detalhes
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="glass-card p-5 text-center shadow">
                    <h3 className="fw-bold">Bem-vindo à Área Operacional</h3>
                    <p className="text-secondary mt-3 mb-0">
                      Você está logado como <strong className="text-white">{currentUser?.email}</strong>.
                    </p>
                  </div>
                )
              )}

              {/* TELA: AUDITORIA */}
              {activeTab === 'audit' && role === 'admin' && (
                <div className="glass-card p-0 overflow-hidden shadow">
                  <Table hover responsive variant="dark" className="mb-0 align-middle">
                    <thead className="bg-dark text-secondary small text-uppercase fw-bold">
                      <tr className="border-bottom border-secondary border-opacity-10">
                        <th className="px-4 py-3">Data/Hora</th>
                        <th>Usuário</th>
                        <th>Método</th>
                        <th>URL</th>
                        <th className="text-end px-4">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.log_id} className="border-bottom border-secondary border-opacity-10">
                          <td className="px-4 text-secondary small">{new Date(log.executed_at).toLocaleString()}</td>
                          <td>
                            <div className="fw-bold text-white-50">{log.user_name || 'Sistema'}</div>
                            <div className="text-secondary small">{log.user_email}</div>
                          </td>
                          <td>
                            <Badge bg={log.method === 'GET' ? 'success' : 'info'} className="bg-opacity-25 fw-bold" style={{ width: '60px' }}>
                              {log.method}
                            </Badge>
                          </td>
                          <td className="text-truncate text-secondary" style={{ maxWidth: '200px' }}>{log.url}</td>
                          <td className="text-end px-4 text-secondary small mono">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}