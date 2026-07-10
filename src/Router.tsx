import type { ComponentType } from 'react'
import App from './App'
import MediaRelay from './pages/MediaRelay'

const ROUTES: Record<string, ComponentType> = {
  '/relais': MediaRelay,
}

export default function Router() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Page = ROUTES[path] ?? App
  return <Page />
}
