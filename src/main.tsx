import '@/styles/global.css'

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return

  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledFrame: 'bypass', quiet: import.meta.env.PROD })
}

async function bootstrap() {
  await enableMocking()
  const { renderApp } = await import('./app')
  renderApp(document.getElementById('root')!)
}

bootstrap()
