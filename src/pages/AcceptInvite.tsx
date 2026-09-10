import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Users, ArrowRight } from 'lucide-react'
import { getInvitationByToken, acceptInvitation } from '../lib/invitations'
import { Button } from '../components/ui'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [error, setError] = useState('')
  const [invitation, setInvitation] = useState<any>(null)

  useEffect(() => {
    if (token) {
      loadInvitation()
    } else {
      setStatus('error')
      setError('Link de convite inválido')
      setLoading(false)
    }
  }, [token])

  async function loadInvitation() {
    if (!token) return

    try {
      const inv = await getInvitationByToken(token)
      if (!inv) {
        setStatus('error')
        setError('Convite não encontrado')
        return
      }

      if (inv.status !== 'pending') {
        setStatus(inv.status === 'expired' ? 'expired' : 'error')
        setError(inv.status === 'expired' ? 'Este convite já expirou' : 'Este convite já foi utilizado')
        return
      }

      if (new Date(inv.expires_at) < new Date()) {
        setStatus('expired')
        setError('Este convite expirou')
        return
      }

      setInvitation(inv)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError('Erro ao carregar convite')
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept() {
    if (!token) return

    setLoading(true)
    try {
      const result = await acceptInvitation(token)
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(result.error || 'Erro ao aceitar convite')
      }
    } catch (err) {
      setStatus('error')
      setError('Erro ao aceitar convite')
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Verificando convite...</p>
        </div>
      </div>
    )
  }

  if (status === 'success' && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo à equipe!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Você foi adicionado à equipe com sucesso.
          </p>
          <Link to="/dashboard">
            <Button icon={<ArrowRight size={18} />}>
              Ir para Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  if (status === 'success' && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Você foi convidado!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            Você foi convidado para fazer parte da equipe
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Equipe</span>
              <span className="font-medium text-gray-900 dark:text-white">{invitation.team_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Papel</span>
              <span className="font-medium text-blue-600">{invitation.role_name}</span>
            </div>
          </div>

          <Button
            onClick={handleAccept}
            className="w-full"
            size="lg"
            disabled={loading}
            icon={loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          >
            {loading ? 'Aceitando...' : 'Aceitar Convite'}
          </Button>

          <Link
            to="/login"
            className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Fazer login para aceitar
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Convite Inválido
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error || 'Este link de convite não é válido ou já foi utilizado.'}
        </p>
        <Link to="/signup">
          <Button variant="secondary">Criar uma conta</Button>
        </Link>
      </motion.div>
    </div>
  )
}
