import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function BrokenView(): never {
  throw new Error('Falha de renderização')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('apresenta uma recuperação para erros inesperados de renderização', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    render(
      <ErrorBoundary>
        <BrokenView />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('heading', { name: 'Algo deu errado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recarregar aplicação' })).toBeInTheDocument()
  })
})
