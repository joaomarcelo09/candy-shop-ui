import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { loginSchema, type LoginSchema } from '../schemas/auth'
import { useAuthStore } from '../stores/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const loading = useAuthStore((state) => state.loading)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="absolute left-[-8rem] top-[-4rem] h-56 w-56 rounded-full bg-strawberry-500/20 blur-3xl"></div>
      <div className="absolute bottom-[-2rem] right-[-2rem] h-48 w-48 rounded-full bg-tangerine-500/30 blur-3xl"></div>

      <div className="glass-card relative z-10 w-full max-w-md p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-cocoa-800/55">Candy Shop</p>
        <h1 className="mt-4 font-display text-4xl leading-none text-cocoa-900">Sales dashboard</h1>
        <p className="mt-3 text-sm text-cocoa-800/70">
          Sign in and jump straight into the live selling flow.
        </p>

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={handleSubmit(async (values) => {
            try {
              await login(values)
              navigate('/dashboard', { replace: true })
            } catch {
              return
            }
          })}
        >
          <Input label="Email" type="email" placeholder="seller@candies.com" error={errors.email?.message} {...register('email')} />
          <Input
            label="Password"
            type="password"
            placeholder="******"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Signing in...' : 'Enter dashboard'}
          </Button>
        </form>
      </div>
    </div>
  )
}
