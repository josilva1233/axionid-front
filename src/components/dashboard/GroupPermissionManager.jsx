// pages/dashboard/GroupEdit.jsx (ou onde você preferir)
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import GroupPermissionManager from "@/components/dashboard/GroupPermissionManager";

export default function GroupEdit() {
  const { groupId } = useParams(); // pega o ID da URL
  const [group, setGroup] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar grupo (com permissões) e todas as permissões
        const [groupRes, permsRes] = await Promise.all([
          axios.get(`/api/v1/groups/${groupId}?with=permissions`), // ajuste conforme sua rota
          axios.get("/api/v1/admin/permissions")
        ]);
        setGroup(groupRes.data);
        // A rota de permissões pode retornar paginado
        setAllPermissions(permsRes.data.data || permsRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Tratar erro (ex: mostrar toast)
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId]);

  // 🔗 Adicionar permissão
  const handleAddPermission = async (permissionName) => {
    setActionLoading(true);
    try {
      await axios.post(`/api/v1/admin/groups/${groupId}/permissions`, {
        permission_name: permissionName
      });
      // Recarregar o grupo para atualizar a lista
      const groupRes = await axios.get(`/api/v1/groups/${groupId}?with=permissions`);
      setGroup(groupRes.data);
      // Opcional: notificação de sucesso
    } catch (error) {
      console.error("Erro ao adicionar permissão:", error);
      // Exibir erro (ex: permissão já vinculada)
    } finally {
      setActionLoading(false);
    }
  };

  // ❌ Remover permissão
  const handleRemovePermission = async (permissionId) => {
    setActionLoading(true);
    try {
      await axios.delete(`/api/v1/admin/groups/${groupId}/permissions/${permissionId}`);
      // Recarregar o grupo
      const groupRes = await axios.get(`/api/v1/groups/${groupId}?with=permissions`);
      setGroup(groupRes.data);
    } catch (error) {
      console.error("Erro ao remover permissão:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-white p-4">Carregando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Gerenciar Grupo: {group?.name}</h1>
      <GroupPermissionManager
        group={group}
        permissions={allPermissions}
        onAddPermission={handleAddPermission}
        onRemovePermission={handleRemovePermission}
        actionLoading={actionLoading}
        canManage={true} // ou baseado em permissão do usuário
      />
    </div>
  );
}