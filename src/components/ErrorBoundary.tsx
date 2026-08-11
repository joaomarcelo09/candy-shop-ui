import { Component, type ErrorInfo, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unexpected render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-dvh place-items-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-strawberry-50 text-strawberry-600">
              <TriangleAlert className="size-6" />
            </div>
            <h1 className="mt-4 font-display text-3xl text-cocoa-900">Algo deu errado</h1>
            <p className="mt-2 text-sm leading-relaxed text-cocoa-800/60">
              A tela encontrou um erro inesperado. Recarregue para tentar novamente.
            </p>
            <Button className="mt-5" onClick={() => window.location.reload()}>
              Recarregar aplicação
            </Button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
