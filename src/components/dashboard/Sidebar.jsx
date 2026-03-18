export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  const isAdmin = role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand">
          <h1>
            Axion<span>ID</span> 
            <small style={{ 
              fontSize: '0.5em', 
              display: 'block', 
              opacity: 0.7,
              fontWeight: '300',
              marginTop: '-5px'
            }}>
              {isAdmin ? 'Admin' : 'Comum'}
            </small>
          </h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {/* SEÇÃO PRINCIPAL */}
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

        {/* --- NOVA SEÇÃO: SUPORTE (ORDENS DE SERVIÇO) --- */}
        <div className="nav-group animate-in" style={{ marginTop: '24px' }}>
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