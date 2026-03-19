import { useState, type FormEvent } from 'react'
import { LuKeyRound, LuMail } from 'react-icons/lu'
import { isSupabaseConfigured } from '../lib/env'
import { ensureSupabaseConfig, supabase } from '../lib/supabase'

interface LoginPageProps {
  onLoggedIn: () => void
}

export const LoginPage = ({ onLoggedIn }: LoginPageProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (password.length < 8) {
      setErrorMessage('A senha precisa ter no mínimo 8 caracteres.')
      return
    }

    try {
      ensureSupabaseConfig()
      setIsSubmitting(true)

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      onLoggedIn()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha no login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-pattern p-4">
      <div className="w-full max-w-[480px] border border-border bg-surface p-6 shadow-soft">
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-muted">
          Personal Finance
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">
          Entrar na plataforma
        </h1>
        <p className="mt-2 text-sm text-muted">
          Login por email e senha com persistência curta de 4h.
        </p>

        {!isSupabaseConfigured ? (
          <div className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Defina as variáveis de ambiente do Supabase para autenticar.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-muted">Email</span>
            <span className="field">
              <LuMail className="h-4 w-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="você@exemplo.com"
                className="field-input"
              />
            </span>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-muted">Senha</span>
            <span className="field">
              <LuKeyRound className="h-4 w-4 text-muted" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                className="field-input"
              />
            </span>
          </label>

          {errorMessage ? (
            <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured}
            className="mt-2 border border-primary bg-primary px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
