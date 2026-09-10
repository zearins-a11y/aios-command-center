import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function AuthGuard({ children, redirectTo = '/login', requireAuth = true }: AuthGuardProps) {
  const { user, initialized } = useAuth()
  const navigate = useNavigate()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    // Don't show loader immediately, give a small delay for smoother UX
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!initialized) return

    if (requireAuth && !user) {
      // Redirect to login if auth is required but user is not logged in
      navigate(redirectTo, { replace: true })
    }
  }, [initialized, user, requireAuth, redirectTo, navigate])

  // Show loading state
  if (!initialized || showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not logged in
  if (requireAuth && !user) {
    return null // Will redirect
  }

  return <>{children}</>
}

// HOC version for wrapping components
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { requireAuth?: boolean; redirectTo?: string }
) {
  return function WithAuthComponent(props: P) {
    return (
      <AuthGuard requireAuth={options?.requireAuth} redirectTo={options?.redirectTo}>
        <WrappedComponent {...props} />
      </AuthGuard>
    )
  }
}
