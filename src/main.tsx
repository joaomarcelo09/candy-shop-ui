import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { queryClient } from './queryClient'
import './index.css'

async function enableApiMocks() {
  if (import.meta.env.VITE_ENABLE_API_MOCKS !== 'true') return

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      registrations
        .filter((registration) =>
          registration.active?.scriptURL.endsWith('/mockServiceWorker.js'),
        )
        .map((registration) => registration.unregister()),
    )
  }

  const { startApiMock } = await import('./mocks/apiMock')
  startApiMock()
}

async function bootstrap() {
  await enableApiMocks()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 2600,
                style: {
                  borderRadius: '16px',
                  background: '#2d160f',
                  color: '#fff',
                  fontSize: '14px',
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

void bootstrap()
