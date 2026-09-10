import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Activity, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '../../components/ui'
import { usePermissions } from '../../contexts/PermissionsContext'
import { getAuditLogs, AuditLog, formatAction, getActionColor, AuditFilters, AuditAction } from '../../lib/audit'

const MODULES = [
  { value: '', label: 'Todos os módulos' },
  { value: 'governance', label: 'Governança' },
  { value: 'appeals', label: 'Recursos' },
  { value: 'strikes', label: 'Strikes' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'council', label: 'Conselho' },
  { value: 'evaluations', label: 'Avaliações' },
  { value: 'exceptions', label: 'Exceções' },
  { value: 'health', label: 'Saúde' },
  { value: 'regional', label: 'Regional' },
]

const ACTIONS: { value: AuditAction | ''; label: string }[] = [
  { value: '', label: 'Todas as ações' },
  { value: 'create', label: 'Criar' },
  { value: 'update', label: 'Atualizar' },
  { value: 'delete', label: 'Excluir' },
  { value: 'approve', label: 'Aprovar' },
  { value: 'reject', label: 'Rejeitar' },
]

export default function AuditLogs() {
  const { permissions, loading: permissionsLoading, checkGestor } = usePermissions()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditFilters>({})
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const isGestor = checkGestor()

  useEffect(() => {
    if (permissions?.teamId && isGestor) {
      loadLogs()
    } else {
      setLoading(false)
    }
  }, [permissions?.teamId, isGestor, filters])

  async function loadLogs() {
    setLoading(true)
    try {
      const filtersWithTeam: AuditFilters = {
        ...filters,
        teamId: permissions?.teamId || undefined,
      }
      const data = await getAuditLogs(filtersWithTeam)
      setLogs(data)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return formatDate(dateString)
  }

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isGestor) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Você precisa ser gestor ou superior para ver os logs de auditoria.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logs de Auditoria</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Histórico de todas as ações realizadas na equipe
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showFilters
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Módulo
              </label>
              <select
                value={filters.module || ''}
                onChange={(e) => setFilters({ ...filters, module: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {MODULES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ação
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: (e.target.value as AuditAction) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                {ACTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Logs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum registro encontrado</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.user_name || log.user_email || 'Usuário desconhecido'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        {' '}
                        <span className="capitalize">{log.resource_type}</span>
                        {log.resource_id && (
                          <span className="text-gray-400">#{log.resource_id.slice(0, 8)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="gray" className="capitalize">
                      {log.module_name}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {expandedLog === log.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Módulo:</span>
                      <span className="ml-2 text-gray-900 dark:text-white capitalize">{log.module_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tipo:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{log.resource_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Data:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{formatDate(log.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Usuário:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{log.user_email}</span>
                    </div>
                  </div>

                  {(log.old_value || log.new_value) && (
                    <div className="mt-3 flex gap-4">
                      {log.old_value && (
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor anterior:</p>
                          <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-2 rounded overflow-auto max-h-24">
                            {JSON.stringify(log.old_value, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.new_value && (
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Novo valor:</p>
                          <pre className="text-xs bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-2 rounded overflow-auto max-h-24">
                            {JSON.stringify(log.new_value, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
