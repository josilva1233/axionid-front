// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserPermissions = useCallback(async () => {
    try {
      const token = localStorage.getItem('@AxionID:token');
      if (!token) return [];

      const response = await api.get('/api/v1/me/permissions');
      const perms = response.data.permissions || [];
      const permNames = perms.map(p => p.name);
      
      setPermissions(permNames);
      
      localStorage.setItem('@AxionID:permissions', JSON.stringify(permNames));
      localStorage.setItem('@AxionID:is_admin', response.data.is_admin ? 'true' : 'false');
      
      return permNames;
    } catch (error) {
      
      const cached = localStorage.getItem('@AxionID:permissions');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPermissions(parsed);
          return parsed;
        } catch (e) {}
      }
      
      return [];
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('@AxionID:token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(localStorage.getItem('@AxionID:user') || '{}');
        setUser(userData);

        if (!userData?.id) {
          const response = await api.get('/api/v1/me');
          setUser(response.data);
          localStorage.setItem('@AxionID:user', JSON.stringify(response.data));
        }

        await loadUserPermissions();
        
      } catch (error) {
  
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [loadUserPermissions]);

  const hasPermission = useCallback((permissionName) => {
    if (!permissionName) return true;
    if (user?.is_admin) return true;
    return permissions.includes(permissionName);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((permissionNames) => {
    if (user?.is_admin) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.some(name => permissions.includes(name));
  }, [user, permissions]);

  const hasAllPermissions = useCallback((permissionNames) => {
    if (user?.is_admin) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    return permissionNames.every(name => permissions.includes(name));
  }, [user, permissions]);

  return {
    user,
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}