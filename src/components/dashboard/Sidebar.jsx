export default function Sidebar({ activeTab, setActiveTab, role, onLogout }) {
  // Verifica se é admin para facilitar as condições abaixo
  const isAdmin = role === 'admin';

  return (
    <aside className="sidebar">
      {/* BRAND DINÂMICA: Muda de acordo com o cargo */}
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

        {/* SEÇÃO PRINCIPAL/OPERAÇÃO */}
        <div className="nav-group">
          {/* Título dinâmico: Principal para Admin, Operação para Comum */}
          <p className="nav-section-title">
            {isAdmin ? 'Principal' : 'Operação'}
          </p>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">
              {isAdmin ? 'Gestão de Usuários' : 'Usuários'}
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