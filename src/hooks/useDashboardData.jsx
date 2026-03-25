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
  const [usersPagination, setUsersPagination] = useState({ current: 1, last: 1, total: 0, perPage: 10 });
  const [groupsPagination, setGroupsPagination] = useState({ current: 1, last: 1, total: 0, perPage: 10 });
  const [auditPagination, setAuditPagination] = useState({ current: 1, last: 1, total: 0, perPage: 20 }); // ← 20 para audit

  // Listar Usuários (10 por página)
  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);
      
      const res = await api.get(`/api/v1/admin/users?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setUsers(responseData.data);
        setUsersPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 10
        });
      } else {
        setUsers([]);
        setUsersPagination({ current: 1, last: 1, total: 0, perPage: 10 });
      }
    } catch (err) { 
      console.error(err); 
      setUsers([]);
    } finally { 
      setLoading(false); 
    }
  }, [role, filters.name, filters.completed]);

  // Listar Grupos (10 por página)
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.name) params.append("name", filters.name);
      
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setGroups(responseData.data);
        setGroupsPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 10
        });
      } else {
        setGroups([]);
        setGroupsPagination({ current: 1, last: 1, total: 0, perPage: 10 });
      }
    } catch (err) { 
      console.error(err); 
      setGroups([]);
    } finally { 
      setLoading(false); 
    }
  }, [filters.name]);

  // Listar Logs de Auditoria (20 por página - como a API retorna)
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);
      
      const res = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
      const responseData = res.data;
      
      console.log("Audit Logs Response:", {
        current_page: responseData.current_page,
        last_page: responseData.last_page,
        total: responseData.total,
        per_page: responseData.per_page,
        data_count: responseData.data?.length
      });
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setAuditLogs(responseData.data);
        setAuditPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 20 // ← usa o valor da API (20)
        });
      } else {
        setAuditLogs([]);
        setAuditPagination({ current: 1, last: 1, total: 0, perPage: 20 });
      }
    } catch (err) { 
      console.error("Erro ao carregar logs:", err); 
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