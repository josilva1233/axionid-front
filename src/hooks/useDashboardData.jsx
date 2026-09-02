// hooks/useDashboardData.jsx
import { useState, useCallback } from "react";
import api from "../services/api";

export function useDashboardData(role) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    user: "",
    url: "",
    method: "",
    start_date: "",
    end_date: "",
    protocol: "",
    title: "",
    applicant: "",
    priority: "",
    status: "",
    label: "",
    perm_name: "",
  });

  const [usersPagination, setUsersPagination] = useState({ current: 1, last: 1, total: 0, perPage: 10 });
  const [groupsPagination, setGroupsPagination] = useState({ current: 1, last: 1, total: 0, perPage: 15 });
  const [auditPagination, setAuditPagination] = useState({ current: 1, last: 1, total: 0, perPage: 20 });
  const [ordersPagination, setOrdersPagination] = useState({ current: 1, last: 1, total: 0, perPage: 10 });
  const [permissionsPagination, setPermissionsPagination] = useState({ current: 1, last: 1, total: 0, perPage: 10 });

  const isAdmin = role === "admin";

  // ---- USUÁRIOS ----
  const loadUsers = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);

      const res = await api.get(`/api/v1/admin/users?${params.toString()}`);
      const data = res.data;
      if (data.data) {
        setUsers(data.data);
        setUsersPagination({
          current: data.current_page || 1,
          last: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10,
        });
      } else {
        setUsers([]);
      }
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters.name, filters.completed]);

// ---- GRUPOS ----
  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 15 });
      if (filters.name) params.append("name", filters.name);

      const res = await api.get(`/api/v1/groups?${params.toString()}`);
      const data = res.data;
      if (data.data) {
        setGroups(data.data);
        setGroupsPagination({
          current: data.current_page || 1,
          last: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 15,
        });
      } else {
        setGroups([]);
      }
    } catch (err) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [filters.name]);

  // ---- LOGS DE AUDITORIA ----
  const loadAuditLogs = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 20 });
      if (filters.user) params.append("user", filters.user);
      if (filters.url) params.append("url", filters.url);
      if (filters.method) params.append("method", filters.method);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const res = await api.get(`/api/v1/admin/audit-logs?${params.toString()}`);
      const data = res.data;
      if (data.data) {
        setAuditLogs(data.data);
        setAuditPagination({
          current: data.current_page || 1,
          last: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 20,
        });
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      if (err.response) {
      }
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters.user, filters.url, filters.method, filters.start_date, filters.end_date]);

  // ---- ORDENS DE SERVIÇO ----
  const loadServiceOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.protocol) params.append("protocol", filters.protocol);
      if (filters.title) params.append("title", filters.title);
      if (filters.applicant) params.append("applicant", filters.applicant);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.status) params.append("status", filters.status);

      const res = await api.get(`/api/v1/service-orders?${params.toString()}`);
      const data = res.data;
      if (data.data) {
        setServiceOrders(data.data);
        setOrdersPagination({
          current: data.current_page || 1,
          last: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10,
        });
      } else {
        setServiceOrders([]);
      }
    } catch (err) {
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters.protocol, filters.title, filters.applicant, filters.priority, filters.status]);

  // ---- PERMISSÕES ----
  const loadPermissions = useCallback(async (page = 1) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: 10 });
      if (filters.label) params.append("label", filters.label);
      if (filters.perm_name) params.append("name", filters.perm_name);

      const res = await api.get(`/api/v1/admin/permissions?${params.toString()}`);
      const data = res.data;
      if (data.data) {
        setPermissions(data.data);
        setPermissionsPagination({
          current: data.current_page || 1,
          last: data.last_page || 1,
          total: data.total || 0,
          perPage: data.per_page || 10,
        });
      } else {
        setPermissions([]);
      }
    } catch (err) {
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters.label, filters.perm_name]);

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
    loadPermissions,
  };
}