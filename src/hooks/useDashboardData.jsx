// hooks/useDashboardData.js
import { useState, useCallback, useRef, useEffect } from "react";
import api from "../services/api";

export function useDashboardData(role) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  // =========================================================
  // FILTROS - COMPLETO PARA TODAS AS ABAS
  // =========================================================
  const [filters, setFilters] = useState({ 
    // Filtros de Usuários
    name: "", 
    completed: "", 
    // Filtros de Auditoria (SEGURANÇA)
    user: "",
    url: "",
    method: "", 
    start_date: "",
    end_date: "",
    // Filtros de Ordens de Serviço
    protocol: "",
    title: "",
    applicant: "",
    priority: "",
    status: "",
    // Filtros de Permissões
    label: "",
    perm_name: ""
  });
  
  // Paginação separada para cada tipo
  const [usersPagination, setUsersPagination] = useState({ 
    current: 1, 
    last: 1, 
    total: 0, 
    perPage: 10 
  });
  const [groupsPagination, setGroupsPagination] = useState({ 
    current: 1, 
    last: 1, 
    total: 0, 
    perPage: 15 
  });
  const [auditPagination, setAuditPagination] = useState({ 
    current: 1, 
    last: 1, 
    total: 0, 
    perPage: 20 
  });
  const [ordersPagination, setOrdersPagination] = useState({ 
    current: 1, 
    last: 1, 
    total: 0, 
    perPage: 10 
  });
  const [permissionsPagination, setPermissionsPagination] = useState({ 
    current: 1, 
    last: 1, 
    total: 0, 
    perPage: 10 
  });

  // =========================================================
  // UTILITÁRIOS
  // =========================================================
  const isAdmin = role === "admin";

  // =========================================================
  // LISTAR USUÁRIOS
  // =========================================================
  const loadUsers = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        per_page: String(10) 
      });
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
      } else if (Array.isArray(responseData)) {
        const allUsers = responseData;
        const total = allUsers.length;
        const perPage = 10;
        const lastPage = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setUsers(allUsers.slice(start, end));
        setUsersPagination({
          current: page,
          last: lastPage || 1,
          total: total,
          perPage: perPage
        });
      } else {
        setUsers([]);
        setUsersPagination({ current: 1, last: 1, total: 0, perPage: 10 });
      }
    } catch (err) { 
      setUsers([]);
    } finally { 
      setLoading(false); 
    }
  }, [isAdmin, filters.name, filters.completed]);

  // =========================================================
  // LISTAR GRUPOS
  // =========================================================
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        per_page: String(15) 
      });
      if (filters.name) params.append("name", filters.name);
      
      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setGroups(responseData.data);
        setGroupsPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 15
        });
      } else if (Array.isArray(responseData)) {
        const allGroups = responseData;
        const total = allGroups.length;
        const perPage = 15;
        const lastPage = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setGroups(allGroups.slice(start, end));
        setGroupsPagination({
          current: page,
          last: lastPage || 1,
          total: total,
          perPage: perPage
        });
      } else {
        setGroups([]);
        setGroupsPagination({ current: 1, last: 1, total: 0, perPage: 15 });
      }
    } catch (err) { 
      setGroups([]);
    } finally { 
      setLoading(false); 
    }
  }, [filters.name]);

  // =========================================================
  // LISTAR LOGS DE AUDITORIA (SEGURANÇA)
  // =========================================================
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        per_page: String(20) 
      });
      
      if (filters.user) params.append("user", filters.user);
      if (filters.url) params.append("url", filters.url);
      if (filters.method) params.append("method", filters.method);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      console.log("🔍 Parâmetros do Audit:", params.toString());

      const res = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setAuditLogs(responseData.data);
        setAuditPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 20
        });
      } else if (Array.isArray(responseData)) {
        const allLogs = responseData;
        const total = allLogs.length;
        const perPage = 20;
        const lastPage = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setAuditLogs(allLogs.slice(start, end));
        setAuditPagination({
          current: page,
          last: lastPage || 1,
          total: total,
          perPage: perPage
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
  }, [
    isAdmin,
    filters.user,
    filters.url,
    filters.method,
    filters.start_date,
    filters.end_date
  ]);

  // =========================================================
  // LISTAR ORDENS DE SERVIÇO
  // =========================================================
  const loadServiceOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        per_page: String(10) 
      });
      
      if (filters.protocol) params.append("protocol", filters.protocol);
      if (filters.title) params.append("title", filters.title);
      if (filters.applicant) params.append("applicant", filters.applicant);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.status) params.append("status", filters.status);

      console.log("🔍 Parâmetros da OS:", params.toString());

      const res = await api.get(`/api/v1/service-orders?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setServiceOrders(responseData.data);
        setOrdersPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 10
        });
      } else if (Array.isArray(responseData)) {
        const allOrders = responseData;
        const total = allOrders.length;
        const perPage = 10;
        const lastPage = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setServiceOrders(allOrders.slice(start, end));
        setOrdersPagination({
          current: page,
          last: lastPage || 1,
          total: total,
          perPage: perPage
        });
      } else {
        setServiceOrders([]);
        setOrdersPagination({ current: 1, last: 1, total: 0, perPage: 10 });
      }
    } catch (err) { 
      setServiceOrders([]);
    } finally { 
      setLoading(false); 
    }
  }, [
    filters.protocol, 
    filters.title, 
    filters.applicant, 
    filters.priority, 
    filters.status
  ]);

  // =========================================================
  // LISTAR PERMISSÕES COM FILTROS
  // =========================================================
  const loadPermissions = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        per_page: String(10) 
      });
      
      if (filters.label) params.append("label", filters.label);
      if (filters.perm_name) params.append("name", filters.perm_name);

      const res = await api.get(`/api/v1/admin/permissions?${params.toString()}`);
      const responseData = res.data;
      
      if (responseData.data && Array.isArray(responseData.data)) {
        setPermissions(responseData.data);
        setPermissionsPagination({
          current: responseData.current_page || 1,
          last: responseData.last_page || 1,
          total: responseData.total || 0,
          perPage: responseData.per_page || 10
        });
      } else if (Array.isArray(responseData)) {
        const allPermissions = responseData;
        const total = allPermissions.length;
        const perPage = 10;
        const lastPage = Math.ceil(total / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setPermissions(allPermissions.slice(start, end));
        setPermissionsPagination({
          current: page,
          last: lastPage || 1,
          total: total,
          perPage: perPage
        });
      } else {
        setPermissions([]);
        setPermissionsPagination({ current: 1, last: 1, total: 0, perPage: 10 });
      }
    } catch (err) { 
      setPermissions([]);
    } finally { 
      setLoading(false); 
    }
  }, [
    isAdmin,
    filters.label,
    filters.perm_name
  ]);

  // =========================================================
  // RETORNAR
  // =========================================================
  return { 
    loading, 
    users, 
    groups, 
    auditLogs, 
    serviceOrders,
    permissions,
    usersPagination,
    groupsPagination,
    auditPagination,
    ordersPagination,
    permissionsPagination,
    filters, 
    setFilters, 
    loadUsers, 
    loadGroups, 
    loadAuditLogs,
    loadServiceOrders,
    loadPermissions
  };
}