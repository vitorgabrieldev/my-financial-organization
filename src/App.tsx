import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  LuChartColumnBig,
  LuChartNoAxesCombined,
  LuFolderKanban,
  LuGoal,
  LuHouse,
  LuUserCog,
  LuWalletCards,
} from 'react-icons/lu'
import { AccessDenied } from './components/AccessDenied'
import { AppLayout } from './components/AppLayout'
import { PageSkeleton } from './components/PageSkeleton'
import {
  fetchUserPermissions,
  fetchUserProfile,
  getOrCreatePreferences,
} from './lib/db'
import { can, buildPermissionMap } from './lib/permissions'
import {
  clearSessionStart,
  isSessionExpired,
  registerSessionStart,
  resetSessionStart,
} from './lib/session'
import { supabase } from './lib/supabase'
import type { AppModule, ModulePermission, UserPreferences, UserProfile } from './types/finance'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { AccountsPage } from './pages/AccountsPage'
import { GoalsPage } from './pages/GoalsPage'
import { ReportsPage } from './pages/ReportsPage'
import { UsersPage } from './pages/UsersPage'

const App = () => {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<ModulePermission[]>([])
  const [preferencesError, setPreferencesError] = useState('')

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      setAuthLoading(true)
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return

      const sessionUser = data.session?.user ?? null
      if (sessionUser) {
        if (isSessionExpired()) {
          await supabase.auth.signOut()
          clearSessionStart()
          setUser(null)
          setPreferences(null)
          setProfile(null)
          setPermissions([])
        } else {
          registerSessionStart()
          setUser(sessionUser)
          setPreferences(null)
          setProfile(null)
          setPermissions([])
        }
      } else {
        clearSessionStart()
        setUser(null)
        setPreferences(null)
        setProfile(null)
        setPermissions([])
      }
      setAuthLoading(false)
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        clearSessionStart()
        setUser(null)
        setPreferences(null)
        setProfile(null)
        setPermissions([])
        setPreferencesError('')
        return
      }

      if (session?.user) {
        if (event === 'SIGNED_IN') {
          resetSessionStart()
        } else {
          registerSessionStart()
        }
        setUser(session.user)
        setPreferences(null)
        setProfile(null)
        setPermissions([])
        setPreferencesError('')
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    let isMounted = true

    const loadAppContext = async () => {
      setPreferencesError('')
      try {
        const [preferencesData, profileData, permissionsData] = await Promise.all([
          getOrCreatePreferences(user.id),
          fetchUserProfile(user.id),
          fetchUserPermissions(user.id),
        ])

        if (!isMounted) return
        setPreferences(preferencesData)
        setProfile(profileData)
        setPermissions(permissionsData)
      } catch (error) {
        if (!isMounted) return
        setPreferencesError(
          error instanceof Error
            ? error.message
            : 'Falha ao carregar preferências do usuário.',
        )
      }
    }

    void loadAppContext()

    return () => {
      isMounted = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const intervalId = window.setInterval(() => {
      if (isSessionExpired()) {
        void supabase.auth.signOut()
      }
    }, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    clearSessionStart()
    setUser(null)
    setPreferences(null)
    setProfile(null)
    setPermissions([])
  }

  if (authLoading) {
    return (
      <div className="p-4">
        <PageSkeleton cards={2} lines={3} withTable />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLoggedIn={() => undefined} />
  }

  if (preferencesError) {
    return (
      <div className="p-4">
        <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {preferencesError}
        </div>
      </div>
    )
  }

  if (!preferences || !profile) {
    return (
      <div className="p-4">
        <PageSkeleton cards={2} lines={4} withTable />
      </div>
    )
  }

  const permissionMap = buildPermissionMap(permissions)

  const hasAccess = (module: AppModule, action: 'view' | 'list' | 'create' | 'edit' | 'delete' = 'view') =>
    can(profile, permissionMap, module, action)

  const navigation = [
    { to: '/dashboard', label: 'Dashboard', icon: LuHouse, module: 'dashboard' as AppModule },
    { to: '/transactions', label: 'Transações', icon: LuWalletCards, module: 'transactions' as AppModule },
    { to: '/categories', label: 'Categorias', icon: LuFolderKanban, module: 'categories' as AppModule },
    { to: '/accounts', label: 'Contas', icon: LuChartColumnBig, module: 'accounts' as AppModule },
    { to: '/goals', label: 'Metas', icon: LuGoal, module: 'goals' as AppModule },
    { to: '/reports', label: 'Relatórios', icon: LuChartNoAxesCombined, module: 'reports' as AppModule },
    { to: '/users', label: 'Usuários', icon: LuUserCog, module: 'users' as AppModule },
  ].filter((item) => hasAccess(item.module, 'view'))

  const moduleDenied = (moduleLabel: string) => <AccessDenied moduleLabel={moduleLabel} />

  return (
    <AppLayout
      userEmail={user.email || 'usuário'}
      userName={profile.full_name}
      navLinks={navigation}
      onSignOut={handleSignOut}
    >
      <Routes>
        <Route
          path="/dashboard"
          element={
            hasAccess('dashboard', 'view') ? (
              <DashboardPage userId={user.id} preferences={preferences} />
            ) : (
              moduleDenied('Dashboard')
            )
          }
        />
        <Route
          path="/transactions"
          element={
            hasAccess('transactions', 'view') ? (
              <TransactionsPage
                userId={user.id}
                preferences={preferences}
                moduleAccess={permissionMap.transactions}
              />
            ) : (
              moduleDenied('Transações')
            )
          }
        />
        <Route
          path="/categories"
          element={
            hasAccess('categories', 'view') ? (
              <CategoriesPage userId={user.id} moduleAccess={permissionMap.categories} />
            ) : (
              moduleDenied('Categorias')
            )
          }
        />
        <Route
          path="/accounts"
          element={
            hasAccess('accounts', 'view') ? (
              <AccountsPage
                userId={user.id}
                preferences={preferences}
                moduleAccess={permissionMap.accounts}
              />
            ) : (
              moduleDenied('Contas')
            )
          }
        />
        <Route
          path="/goals"
          element={
            hasAccess('goals', 'view') ? (
              <GoalsPage
                userId={user.id}
                preferences={preferences}
                moduleAccess={permissionMap.goals}
              />
            ) : (
              moduleDenied('Metas')
            )
          }
        />
        <Route
          path="/reports"
          element={
            hasAccess('reports', 'view') ? (
              <ReportsPage
                userId={user.id}
                preferences={preferences}
                moduleAccess={permissionMap.reports}
              />
            ) : (
              moduleDenied('Relatórios')
            )
          }
        />
        <Route
          path="/users"
          element={
            hasAccess('users', 'view') ? (
              <UsersPage
                currentUserId={user.id}
                moduleAccess={permissionMap.users}
              />
            ) : (
              moduleDenied('Usuários')
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate
              to={navigation[0]?.to ?? '/dashboard'}
              replace
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={navigation[0]?.to ?? '/dashboard'}
              replace
            />
          }
        />
      </Routes>
    </AppLayout>
  )
}

export default App
