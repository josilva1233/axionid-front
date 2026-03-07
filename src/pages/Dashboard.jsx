import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/dashboard/Sidebar';
import UserTable from '../components/dashboard/UserTable';
import AuditTable from '../components/dashboard/AuditTable';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/api/v1/users' : '/api/v1/audit-logs';
      const res = await api.get(endpoint);
      if (activeTab === 'users') setUsers(res.data.data || []);
      else setAuditLogs(res.data.data || []);
    } catch { console.error("Erro ao carregar"); } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} onLogout={() => { localStorage.clear(); navigate('/login'); }} />
      <div className="main-wrapper">
        <header className="main-header" style={{padding:'20px 40px', borderBottom:'1px solid var(--border)'}}>
          <h2>{activeTab === 'users' ? 'Usuários' : 'Auditoria'}</h2>
        </header>
        <main className="content-area">
          {loading ? <div className="loader"></div> : (
            activeTab === 'users' ? <UserTable users={users} /> : <AuditTable logs={auditLogs} />
          )}
        </main>
      </div>
    </div>
  );
}