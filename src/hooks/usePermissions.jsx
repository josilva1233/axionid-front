// src/hooks/usePermissions.jsx
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
  const canViewTerms = hasPermission('menu.terms.view');
  const canViewAi = hasPermission('menu.ai.view');
  const canViewCategories = hasPermission('menu.categories.view'); // 🔥 NOVO

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
  // 🔥 PERMISSÕES DE AÇÃO - TERMOS
  // =========================================================
  
  const canManageTerms = hasPermission('terms.manage');

  // =========================================================
  // 🔥 PERMISSÕES DE AÇÃO - CATEGORIAS (NOVO)
  // =========================================================
  
  const canCreateCategory = hasPermission('categories.create');
  const canEditCategory = hasPermission('categories.edit');
  const canDeleteCategory = hasPermission('categories.delete');

  // =========================================================
  // 🔥 UTILITÁRIOS
  // =========================================================

  const canAccessTab = (tab) => {
    const tabPermissions = {
      'users': canViewUsers,
      'groups': canViewGroups,
      'orders': canViewOrders,
      'audit': canViewAudit,
      'permissions': canViewPermissions,
      'terms': canViewTerms,
      'ai': canViewAi,
      'categories': canViewCategories, // 🔥 NOVO
    };
    return tabPermissions[tab] || false;
  };

  const canAccessAnyTab = () => {
    return canViewUsers || canViewGroups || canViewOrders || canViewAudit || 
           canViewPermissions || canViewTerms || canViewAi || canViewCategories; // 🔥 NOVO
  };

  const getFirstAvailableTab = () => {
    const tabs = ['users', 'groups', 'orders', 'ai', 'audit', 'permissions', 'terms', 'categories']; // 🔥 NOVO
    for (const tab of tabs) {
      if (canAccessTab(tab)) {
        return tab;
      }
    }
    return 'orders';
  };

  const isAdmin = user?.is_admin || false;

  return {
    loading,
    
    // Menu
    canViewUsers,
    canViewGroups,
    canViewOrders,
    canViewAudit,
    canViewPermissions,
    canViewTerms,
    canViewAi,
    canViewCategories, // 🔥 EXPORTADO
    
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
    
    // Ações - Termos
    canManageTerms,
    
    // Ações - Categorias (NOVO)
    canCreateCategory,
    canEditCategory,
    canDeleteCategory,
    
    // Utilitários
    canAccessTab,
    canAccessAnyTab,
    getFirstAvailableTab,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}