import { memo } from "react";

const roles = {
  user: 1,
  admin: 2
};

const Sidebar = memo(({ activeTab, setActiveTab, role = "user", onLogout }) => {

  const navItems = [
    { id: "users", label: "Gestão Usuários", icon: "👥", minRole: "user" },
    { id: "audit", label: "Histórico Auditoria", icon: "📜", minRole: "admin" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Axion<span>ID</span></h1>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => {

            if (roles[role] < roles[item.minRole]) return null;

            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="sidebar-footer">
        <div className="user-role-badge">
          Conectado como: <strong>{role}</strong>
        </div>

        <button onClick={() => onLogout?.()} className="btn-logout-sidebar">
          ⏻ Sair
        </button>
      </footer>
    </aside>
  );
});

export default Sidebar;
