import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useDashboardData(role) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);

  const [usersPagination, setUsersPagination] = useState({ current: 1, last: 1, total: 0 });
  const [groupsPagination, setGroupsPagination] = useState({ current: 1, last: 1, total: 0 });
  const [auditPagination, setAuditPagination] = useState({ current: 1, last: 1, total: 0 });
  const [ordersPagination, setOrdersPagination] = useState({ current: 1, last: 1, total: 0 });

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    method: "",
    date: "",
    search: "",
    status: "",
  });

  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/users", {
        params: { page, ...filters },
      });
      const responseData = res.data.data || res.data;
      setUsers(Array.isArray(responseData) ? responseData : responseData.data || []);
      setUsersPagination({
        current: responseData.current_page || page,
        last: responseData.last_page || 1,
        total: responseData.total || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [role, filters]);

  const loadGroups = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/groups", {
        params: { page, ...filters },
      });
      const responseData = res.data.data || res.data;
      setGroups(Array.isArray(responseData) ? responseData : responseData.data || []);
      setGroupsPagination({
        current: responseData.current_page || page,
        last: responseData.last_page || 1,
        total: responseData.total || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/audit-logs", {
        params: { page, ...filters },
      });
      const responseData = res.data.data || res.data;
      setAuditLogs(Array.isArray(responseData) ? responseData : responseData.data || []);
      setAuditPagination({
        current: responseData.current_page || page,
        last: responseData.last_page || 1,
        total: responseData.total || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar auditoria:", err);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [role, filters]);

  const loadServiceOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/service-orders", {
        params: { page, ...filters },
      });
      const responseData = res.data.data || res.data;
      const ordersList = Array.isArray(responseData) ? responseData : responseData.data || [];
      
      setServiceOrders(ordersList);
      setOrdersPagination({
        current: responseData.current_page || page,
        last: responseData.last_page || 1,
        total: responseData.total || ordersList.length,
      });
    } catch (err) {
      console.error("Erro ao carregar ordens de serviço:", err);
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  return {
    loading,
    users,
    groups,
    auditLogs,
    serviceOrders,
    usersPagination,
    groupsPagination,
    auditPagination,
    ordersPagination,
    filters,
    setFilters,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadServiceOrders,
  };
}