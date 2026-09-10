import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Users, FolderKanban, Loader2 } from 'lucide-react'
import { Button, Input, Modal, Badge } from '../../components/ui'
import { usePermissions } from '../../contexts/PermissionsContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { auth } from '../../lib/auth'

interface Workspace {
  id: string
  name: string
  description: string
  owner_id: string
  project_count: number
}

interface Project {
  id: string
  name: string
  description: string
  status: string
}

export default function WorkspaceSettings() {
  const { permissions, loading: permissionsLoading } = usePermissions()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = permissions?.role === 'super_admin'

  useEffect(() => {
    if (permissions?.workspaceId) {
      loadCurrentWorkspace()
    }
    loadWorkspaces()
  }, [permissions?.workspaceId])

  async function loadWorkspaces() {
    if (!isSupabaseConfigured || !supabase) return

    setLoading(true)
    try {
      const user = await auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)

      if (data) {
        const workspacesWithCounts = await Promise.all(
          data.map(async (ws) => {
            const { count } = await supabase!
              .from('projects')
              .select('*', { count: 'exact', head: true })
              .eq('workspace_id', ws.id)
            return { ...ws, project_count: count || 0 }
          })
        )
        setWorkspaces(workspacesWithCounts)
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadCurrentWorkspace() {
    if (!isSupabaseConfigured || !supabase || !permissions?.workspaceId) return

    const { data: ws } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', permissions.workspaceId)
      .single()

    if (ws) {
      setSelectedWorkspace(ws)
      loadProjects(ws.id)
    }
  }

  async function loadProjects(workspaceId: string) {
    if (!isSupabaseConfigured || !supabase) return

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (data) {
      setProjects(data)
    }
  }

  async function handleCreateWorkspace() {
    if (!isSupabaseConfigured || !supabase || !newWorkspaceName.trim()) return

    setSaving(true)
    try {
      const user = await auth.getUser()
      if (!user) return

      const { error } = await supabase.from('workspaces').insert({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc.trim(),
        owner_id: user.id,
      })

      if (!error) {
        setShowCreateWorkspace(false)
        setNewWorkspaceName('')
        setNewWorkspaceDesc('')
        loadWorkspaces()
      }
    } catch (error) {
      console.error('Failed to create workspace:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateProject() {
    if (!isSupabaseConfigured || !supabase || !selectedWorkspace || !newProjectName.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase.from('projects').insert({
        workspace_id: selectedWorkspace.id,
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      })

      if (!error) {
        setShowCreateProject(false)
        setNewProjectName('')
        setNewProjectDesc('')
        loadProjects(selectedWorkspace.id)
        loadWorkspaces()
      }
    } catch (error) {
      console.error('Failed to create project:', error)
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie workspaces e projetos
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setShowCreateWorkspace(true)} icon={<Plus size={18} />}>
            Novo Workspace
          </Button>
        )}
      </div>

      {/* Current Workspace */}
      {selectedWorkspace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Workspace Atual
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedWorkspace.name}
                </h3>
                {selectedWorkspace.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedWorkspace.description}
                  </p>
                )}
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Projetos
          </h2>
          {selectedWorkspace && (
            <Button
              size="sm"
              onClick={() => setShowCreateProject(true)}
              icon={<Plus size={16} />}
            >
              Novo Projeto
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-purple-600" />
                </div>
                <Badge
                  variant={project.status === 'active' ? 'success' : project.status === 'paused' ? 'warning' : 'error'}
                >
                  {project.status === 'active' ? 'Ativo' : project.status === 'paused' ? 'Pausado' : 'Inativo'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          ))}

          {projects.length === 0 && selectedWorkspace && (
            <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum projeto ainda. Crie o primeiro!
              </p>
            </div>
          )}

          {!selectedWorkspace && (
            <div className="col-span-full text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <Building2 className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Você não tem um workspace. Crie um para começar.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* All Workspaces (for super_admin) */}
      {isSuperAdmin && workspaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Meus Workspaces
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {workspaces.map((ws, index) => (
              <div
                key={ws.id}
                className={`flex items-center justify-between p-4 ${
                  index !== workspaces.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ws.name}</p>
                    <p className="text-sm text-gray-500">{ws.project_count} projeto(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {permissions?.workspaceId !== ws.id && (
                    <Button size="sm" variant="ghost">
                      Selecionar
                    </Button>
                  )}
                  {permissions?.workspaceId === ws.id && (
                    <Badge variant="success">Atual</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={showCreateWorkspace}
        onClose={() => setShowCreateWorkspace(false)}
        title="Criar Novo Workspace"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Workspace
            </label>
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Ex: Empresa XYZ"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={newWorkspaceDesc}
              onChange={(e) => setNewWorkspaceDesc(e.target.value)}
              placeholder="Descreva o propósito deste workspace..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateWorkspace(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={saving || !newWorkspaceName.trim()}>
              {saving ? 'Criando...' : 'Criar Workspace'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Criar Novo Projeto"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Projeto
            </label>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Ex: App Mobile"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Descreva o propósito deste projeto..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateProject(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProject} disabled={saving || !newProjectName.trim()}>
              {saving ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
