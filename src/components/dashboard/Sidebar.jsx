export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  // Verifica se é admin para facilitar as condições abaixo
  const isAdmin = role === 'admin';

  return (
    <aside className="sidebar">
      {/* BRAND PADRONIZADA NO TOPO DA SIDEBAR */}
      <div className="sidebar-brand">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {/* SEÇÃO PRINCIPAL - VISÍVEL PARA TODOS */}
        <div className="nav-group">
          <p className="nav-section-title">Principal</p>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">
              {isAdmin ? 'Gestão de Usuários' : 'Usuários'}
            </span>
          </button>

          {/* MENU: GESTÃO DE GRUPOS - Visível para todos, mas o conteúdo interno será filtrado no Dashboard */}
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

        {/* SEÇÃO DE SEGURANÇA - EXCLUSIVA PARA ADMIN */}
        {isAdmin && (
          <div className="nav-group animate-in" style={{ marginTop: '24px' }}>
            <p className="nav-section-title">Segurança</p>
            
            <button 
              className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <span className="nav-icon">📜</span>
              <span className="nav-label">Logs de Auditoria</span>
            </button>

            {/* MENU: PERMISSÕES - Somente Admin */}
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

      {/* FOOTER DA SIDEBAR */}
      <div className="sidebar-footer">
        <button 
          onClick={onLogout} 
          className="btn-logout-sidebar"
          title="Encerrar Sessão"
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Sair do Sistema</span>
        </button>
        
        <div className="sidebar-version">
          v1.0.4-stable
        </div>
      </div>
    </aside>
  );
}