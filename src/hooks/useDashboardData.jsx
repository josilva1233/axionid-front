// hooks/useDashboardData.js
import { useState, useCallback } from "react";
import api from "../services/api";

export function useDashboardData(role) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({ name: "", completed: "", method: "", date: "" });
  
  // Paginação separada para cada tipo
  const [usersPagination, setUsersPagination] = useState({ current: 1, last: 1, total: 0 });
  const [groupsPagination, setGroupsPagination] = useState({ current: 1, last: 1, total: 0 });
  const [auditPagination, setAuditPagination] = useState({ current: 1, last: 1, total: 0 });

  // Listar Usuários
  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);
      
      const res = await api.get(`/api/v1/admin/users?${params.toString()}`);
      const data = res.data.data || res.data;
      
      // Se for resposta paginada
      if (data.data && Array.isArray(data.data)) {
        setUsers(data.data);
        setUsersPagination({
          current: data.current_page,
          last: data.last_page,
          total: data.total
        });
      } else {
        setUsers(Array.isArray(data) ? data : []);
        setUsersPagination({ current: page, last: 1, total: data.length || 0 });
      }
    } catch (err) { 
      console.error(err); 
      setUsers([]);
    } finally { 
      setLoading(false); 
    }
  }, [role, filters.name, filters.completed]);

  // Listar Grupos
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.name) params.append("name", filters.name);
      
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      const data = res.data.data || res.data;
      
      if (data.data && Array.isArray(data.data)) {
        setGroups(data.data);
        setGroupsPagination({
          current: data.current_page,
          last: data.last_page,
          total: data.total
        });
      } else {
        setGroups(Array.isArray(data) ? data : []);
        setGroupsPagination({ current: page, last: 1, total: data.length || 0 });
      }
    } catch (err) { 
      console.error(err); 
      setGroups([]);
    } finally { 
      setLoading(false); 
    }
  }, [filters.name]);

  // Listar Logs de Auditoria
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), per_page: 10 });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);
      
      const res = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
      const data = res.data.data || res.data;
      
      if (data.data && Array.isArray(data.data)) {
        setAuditLogs(data.data);
        setAuditPagination({
          current: data.current_page,
          last: data.last_page,
          total: data.total
        });
      } else {
        setAuditLogs(Array.isArray(data) ? data : []);
        setAuditPagination({ current: page, last: 1, total: data.length || 0 });
      }
    } catch (err) { 
      console.error(err); 
      setAuditLogs([]);
    } finally { 
      setLoading(false); 
    }
  }, [filters.method, filters.date, role]);

  return { 
    loading, 
    users, 
    groups, 
    auditLogs, 
    usersPagination,
    groupsPagination,
    auditPagination,
    filters, 
    setFilters, 
    loadUsers, 
    loadGroups, 
    loadAuditLogs 
  };
}