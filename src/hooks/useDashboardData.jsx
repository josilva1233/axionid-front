import { useState, useCallback } from "react";
import api from "../services/api";

export function useDashboardData(role) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ name: "", completed: "", method: "", date: "" });

  // Listar Usuários
  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);
      
      const res = await api.get(`/api/v1/admin/users?${params.toString()}`);
      setUsers(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [role, filters.name, filters.completed]);

  // Listar Grupos
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.name) params.append("name", filters.name);
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      setGroups(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page, last: res.data.last_page, total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [filters.name]);

  // Listar Logs de Auditoria
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);
      const res = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.data || []);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page, last: res.data.last_page, total: res.data.total,
      } : null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [filters.method, filters.date, role]);

  return { 
    loading, users, setUsers, groups, setGroups, auditLogs, 
    paginationData, filters, setFilters, loadUsers, loadGroups, loadAuditLogs 
  };
}