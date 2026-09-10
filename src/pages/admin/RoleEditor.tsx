import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Save, Loader2, Check } from 'lucide-react'
import { Button, Badge } from '../../components/ui'
import { usePermissions } from '../../contexts/PermissionsContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  permissions?: RolePermission[]
}

interface RolePermission {
  role_id: string
  module_name: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
  can_approve: boolean
}

interface Module {
  name: string
  description: string
  icon: string
}

const MODULES: Module[] = [
  { name: 'governance', description: 'Aprovações e governança', icon: '🛡️' },
  { name: 'appeals', description: 'Recursos e apelações', icon: '⚖️' },
  { name: 'strikes', description: 'Sistema de avisos', icon: '⚠️' },
  { name: 'feedback', description: 'Feedback loop', icon: '💬' },
  { name: 'council', description: 'Conselho consultivo', icon: '👥' },
  { name: 'evaluations', description: 'Avaliação de agentes', icon: '⭐' },
  { name: 'exceptions', description: 'Exceções públicas', icon: '🚨' },
  { name: 'health', description: 'Métricas de saúde', icon: '📊' },
  { name: 'regional', description: 'Adaptação regional', icon: '🌍' },
]

export default function RoleEditor() {
  const { permissions, loading: permissionsLoading, checkAdmin } = usePermissions()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editedPermissions, setEditedPermissions] = useState<Record<string, RolePermission>>({})
  const [saved, setSaved] = useState(false)

  const isAdmin = checkAdmin()

  useEffect(() => {
    if (permissions?.workspaceId) {
      loadRoles()
    }
  }, [permissions?.workspaceId])

  async function loadRoles() {
    if (!isSupabaseConfigured || !supabase) return

    setLoading(true)
    try {
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .eq('is_system', true)
        .order('name')

      const { data: permissionsData } = await supabase
        .from('role_permissions')
        .select('*')

      if (rolesData) {
        const rolesWithPermissions = rolesData.map((role) => ({
          ...role,
          permissions: permissionsData?.filter((p: RolePermission) => p.role_id === role.id) || [],
        }))
        setRoles(rolesWithPermissions)
        if (rolesWithPermissions.length > 0) {
          setSelectedRole(rolesWithPermissions[0])
          setEditedPermissions(
            Object.fromEntries(
              rolesWithPermissions[0].permissions?.map((p: RolePermission) => [p.module_name, p]) || []
            )
          )
        }
      }
    } catch (error) {
      console.error('Failed to load roles:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePermissionChange(moduleName: string, field: keyof RolePermission) {
    const current = editedPermissions[moduleName] || {
      module_name: moduleName,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_approve: false,
    }

    setEditedPermissions({
      ...editedPermissions,
      [moduleName]: {
        ...current,
        [field]: !current[field],
      },
    })
    setSaved(false)
  }

  async function handleSave() {
    if (!isSupabaseConfigured || !supabase || !selectedRole) return

    setSaving(true)
    try {
      // Delete existing permissions
      await supabase.from('role_permissions').delete().eq('role_id', selectedRole.id)

      // Insert new permissions
      const permissionsToInsert = Object.values(editedPermissions).map((p) => ({
        role_id: selectedRole.id,
        module_name: p.module_name,
        can_view: p.can_view,
        can_create: p.can_create,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
        can_approve: p.can_approve,
      }))

      if (permissionsToInsert.length > 0) {
        await supabase.from('role_permissions').insert(permissionsToInsert)
      }

      setSaved(true)
      loadRoles()
    } catch (error) {
      console.error('Failed to save permissions:', error)
    } finally {
      setSaving(false)
    }
  }

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Você precisa ser administrador para editar permissões de papéis.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editor de Papéis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure permissões por papel e módulo
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <Badge variant="success" className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Salvo
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving} icon={<Save size={18} />}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Roles List */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Papéis</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role)
                    setEditedPermissions(
                      Object.fromEntries(
                        role.permissions?.map((p: RolePermission) => [p.module_name, p]) || []
                      )
                    )
                    setSaved(false)
                  }}
                  className={`w-full p-4 text-left transition-colors ${
                    selectedRole?.id === role.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {role.name.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{role.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Permissões para{' '}
                <span className="text-blue-600 capitalize">
                  {selectedRole?.name.replace('_', ' ')}
                </span>
              </h2>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Módulo</div>
              <div className="col-span-2 text-center">Visualizar</div>
              <div className="col-span-2 text-center">Criar</div>
              <div className="col-span-2 text-center">Editar</div>
              <div className="col-span-1 text-center">Excluir</div>
              <div className="col-span-2 text-center">Aprovar</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {MODULES.map((module) => {
                const perm = editedPermissions[module.name] || {
                  can_view: false,
                  can_create: false,
                  can_edit: false,
                  can_delete: false,
                  can_approve: false,
                }

                return (
                  <motion.div
                    key={module.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="col-span-3 flex items-center gap-3">
                      <span className="text-xl">{module.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {module.name}
                        </p>
                        <p className="text-xs text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={perm.can_view}
                        onChange={() => handlePermissionChange(module.name, 'can_view')}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={perm.can_create}
                        onChange={() => handlePermissionChange(module.name, 'can_create')}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={perm.can_edit}
                        onChange={() => handlePermissionChange(module.name, 'can_edit')}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={perm.can_delete}
                        onChange={() => handlePermissionChange(module.name, 'can_delete')}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={perm.can_approve}
                        onChange={() => handlePermissionChange(module.name, 'can_approve')}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
