export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  const isAdmin = role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand">
          <h1>
            Axion<span>ID</span>
            <small className="role-badge-sidebar">
              {isAdmin ? 'Admin' : 'Comum'}
            </small>
          </h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-group">
          <p className="nav-section-title">Principal</p>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">
              {isAdmin ? 'Gestão de Usuários' : 'Operações'}
            </span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <span className="nav-icon">📁</span>
            <span className="nav-label">
              {isAdmin ? 'Gestão de Grupos' : 'Meus Grupos'}
            </span>
          </button>
        </div>

        <div className="nav-group">
          <p className="nav-section-title">Atendimento</p>
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span className="nav-icon">🎫</span>
            <span className="nav-label">
              {isAdmin ? 'Gestão de Chamados' : 'Meus Chamados'}
            </span>
          </button>
        </div>

        {isAdmin && (
          <div className="nav-group">
            <p className="nav-section-title">Segurança</p>
            
            <button 
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-label">Logs de Auditoria</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'permissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              <span className="nav-icon">🛡️</span>
              <span className="nav-label">Permissões</span>
            </button>
          </div>
        )}
      </nav>

<div className="sidebar-footer">
  {/* Separador */}
  <div className="sidebar-divider"></div>
  
  {/* Informações do Usuário */}
  <div className="sidebar-user-info">
    <div className="sidebar-user-avatar" style={{ 
      background: `linear-gradient(135deg, ${currentUser?.avatar_color || '#6366f1'}, ${currentUser?.avatar_color_secondary || '#8b5cf6'})` 
    }}>
      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
    </div>
    <div className="sidebar-user-details">
      <span className="sidebar-user-name">{currentUser?.name || 'Usuário'}</span>
      <span className="sidebar-user-role">
        {isAdmin ? 'Administrador' : 'Usuário'}
      </span>
    </div>
  </div>
  
  {/* Botões de Ação */}
  <div className="sidebar-actions">
    <button 
      onClick={onLogout} 
      className="btn-logout-sidebar"
      title="Encerrar Sessão"
    >
      <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="nav-label">Sair do Sistema</span>
    </button>
  </div>
  
  {/* Versão com Status */}
  <div className="sidebar-version">
    <span className="version-dot"></span>
    <span className="version-text">v1.0.4-stable</span>
    <span className="version-status">● Online</span>
  </div>
</div>
    </aside>
  );
}