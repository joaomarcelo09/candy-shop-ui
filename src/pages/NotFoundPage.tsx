import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <div className="glass-card max-w-md p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cocoa-800/55">404</p>
        <h1 className="mt-3 font-display text-4xl text-cocoa-900">Page not found</h1>
        <p className="mt-3 text-sm text-cocoa-800/70">
          The route does not exist in this dashboard.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
