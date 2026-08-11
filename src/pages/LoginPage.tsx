import { zodResolver } from '@hookform/resolvers/zod'
import { Candy, Eye, EyeOff, FlaskConical, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { loginSchema, type LoginFormValues } from '../schemas/auth'
import { useLoginMutation } from '../queries/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const mockMode = import.meta.env.VITE_ENABLE_API_MOCKS === 'true'
  const mockEmail = import.meta.env.VITE_MOCK_USER_EMAIL ?? ''
  const mockPassword = import.meta.env.VITE_MOCK_USER_PASSWORD ?? ''

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
      <section className="relative hidden overflow-hidden bg-cocoa-950 p-12 text-white lg:flex lg:flex-col xl:p-16">
        <div className="absolute -left-32 -top-32 size-[30rem] rounded-full bg-tangerine-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-[32rem] rounded-full bg-strawberry-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-white text-cocoa-950">
            <Candy className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Loja de doces</p>
            <p className="font-display text-xl">Painel de vendas</p>
          </div>
        </div>

        <div className="relative my-auto max-w-2xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-tangerine-500">Tudo em um só lugar</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.06] xl:text-6xl">
            Estoque organizado para vender com agilidade.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Acompanhe seus doces, registre entradas e mantenha a operação pronta para cada venda.
          </p>
        </div>

        <p className="relative text-sm text-white/35">Controle simples, rápido e seguro.</p>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:bg-white/50">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-tangerine-500/10 to-transparent lg:hidden" />
        <div className="relative w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="grid size-11 place-items-center rounded-2xl bg-cocoa-950 text-white">
              <Candy className="size-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-800/45">Loja de doces</p>
              <p className="font-display text-lg text-cocoa-900">Painel de vendas</p>
            </div>
          </div>

          <p className="text-sm font-bold text-tangerine-500">Bem-vindo de volta</p>
          <h2 className="mt-2 font-display text-4xl text-cocoa-900">Entre na sua conta</h2>
          <p className="mt-3 text-sm leading-relaxed text-cocoa-800/60">
            Use seus dados de acesso para continuar.
          </p>

          {mockMode ? (
            <div className="mt-6 rounded-[20px] border border-tangerine-500/20 bg-tangerine-50 p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-tangerine-500">
                  <FlaskConical className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-tangerine-500">
                    Ambiente de demonstração
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-cocoa-800/60">
                    {mockEmail} · senha {mockPassword}
                  </p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-cocoa-900 underline decoration-tangerine-500/40 underline-offset-4"
                    onClick={() => {
                      setValue('email', mockEmail, { shouldValidate: true })
                      setValue('password', mockPassword, { shouldValidate: true })
                    }}
                  >
                    Preencher conta de teste
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <form
            className={mockMode ? 'mt-6 grid gap-5' : 'mt-8 grid gap-5'}
            onSubmit={handleSubmit(async (values) => {
              try {
                await loginMutation.mutateAsync(values)
                navigate('/estoque', { replace: true })
              } catch {
                setError('root', { message: 'Confira seus dados e tente novamente.' })
              }
            })}
          >
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cocoa-800/35" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-11"
                  placeholder="voce@exemplo.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email ? <p className="text-xs font-bold text-strawberry-600">{errors.email.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cocoa-800/35" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="px-11"
                  placeholder="Sua senha"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-cocoa-800/45 hover:bg-cream-100 hover:text-cocoa-900"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? <p className="text-xs font-bold text-strawberry-600">{errors.password.message}</p> : null}
            </div>

            {errors.root ? (
              <p role="alert" className="rounded-2xl bg-strawberry-50 px-4 py-3 text-sm font-bold text-strawberry-600">
                {errors.root.message}
              </p>
            ) : null}

            <Button type="submit" className="mt-1 w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
