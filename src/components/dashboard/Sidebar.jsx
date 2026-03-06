import { memo } from "react";

const Sidebar = memo(({ activeTab, setActiveTab, role, onLogout }) => {
  
  // Lista de navegação para facilitar a manutenção
  const navItems = [
    { id: "users", label: "Gestão Usuários", icon: "👥", minRole: "user" },
    { id: "audit", label: "Histórico Auditoria", icon: "📜", minRole: "admin" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand">
          <h1>Axion<span>ID</span></h1>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação Principal">
        <div className="nav-group">
          <p className="nav-section-title">Principal</p>
          <ul className="nav-list">
            {navItems.map((item) => {
              // Verifica permissão de visualização
              if (item.minRole === "admin" && role !== "admin") return null;

              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={activeTab === item.id ? "page" : undefined}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <footer className="sidebar-footer">
        <div className="user-role-badge">
          Conectado como: <strong>{role === "admin" ? "Administrador" : "Operador"}</strong>
        </div>
        <button 
          onClick={onLogout} 
          className="btn-logout-sidebar"
          title="Encerrar sessão com segurança"
        >
          <span className="icon">⏻</span> Sair do Sistema
        </button>
      </footer>
    </aside>
  );
});

export default Sidebar;