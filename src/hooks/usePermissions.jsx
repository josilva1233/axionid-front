// hooks/usePermissions.js
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, user, permissions, loading } = useAuth();

  // =========================================================
  // 🔥 PERMISSÕES DO MENU
  // =========================================================
  
  const canViewUsers = hasPermission('menu.users.view');
  const canViewGroups = hasPermission('menu.groups.view');
  const canViewOrders = hasPermission('menu.orders.view');
  const canViewAudit = hasPermission('menu.audit.view');
  const canViewPermissions = hasPermission('menu.permissions.view');

  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - USUÁRIOS
  // =========================================================
  
  const canCreateUser = hasPermission('users.create');
  const canEditUser = hasPermission('users.edit');
  const canDeleteUser = hasPermission('users.delete');
  
  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - GRUPOS
  // =========================================================
  
  const canCreateGroup = hasPermission('groups.create');
  const canEditGroup = hasPermission('groups.edit');
  const canDeleteGroup = hasPermission('groups.delete');
  
  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - ORDENS DE SERVIÇO
  // =========================================================
  
  const canCreateOrder = hasPermission('orders.create');
  const canEditOrder = hasPermission('orders.edit');
  const canDeleteOrder = hasPermission('orders.delete');
  const canAssignOrder = hasPermission('orders.assigned');
  const canChangeOrderStatus = hasPermission('orders.status');

  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - PERMISSÕES
  // =========================================================
  
  const canManagePermissions = hasPermission('permissions.manage');

  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - AUDITORIA
  // =========================================================
  
  const canViewAuditLogs = hasPermission('audit.view');

  // =========================================================
  // 🔥 UTILITÁRIOS
  // =========================================================

  // Verificar se o usuário pode ver uma aba específica
  const canAccessTab = (tab) => {
    const tabPermissions = {
      'users': canViewUsers,
      'groups': canViewGroups,
      'orders': canViewOrders,
      'audit': canViewAudit,
      'permissions': canViewPermissions,
    };
    return tabPermissions[tab] || false;
  };

  // Verificar se o usuário pode ver alguma aba
  const canAccessAnyTab = () => {
    return canViewUsers || canViewGroups || canViewOrders || canViewAudit || canViewPermissions;
  };

  // Obter a primeira aba disponível
  const getFirstAvailableTab = () => {
    const tabs = ['users', 'groups', 'orders', 'audit', 'permissions'];
    for (const tab of tabs) {
      if (canAccessTab(tab)) {
        return tab;
      }
    }
    return 'orders'; // Fallback
  };

  // Verificar se é admin
  const isAdmin = user?.is_admin || false;

  // =========================================================
  // 🔥 RETORNO
  // =========================================================

  return {
    loading,
    
    // Menu
    canViewUsers,
    canViewGroups,
    canViewOrders,
    canViewAudit,
    canViewPermissions,
    
    // Ações - Usuários
    canCreateUser,
    canEditUser,
    canDeleteUser,
    
    // Ações - Grupos
    canCreateGroup,
    canEditGroup,
    canDeleteGroup,
    
    // Ações - Ordens
    canCreateOrder,
    canEditOrder,
    canDeleteOrder,
    canAssignOrder,
    canChangeOrderStatus,
    
    // Ações - Permissões
    canManagePermissions,
    
    // Ações - Auditoria
    canViewAuditLogs,
    
    // Utilitários
    canAccessTab,
    canAccessAnyTab,
    getFirstAvailableTab,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: useAuth().refreshPermissions,
  };
}