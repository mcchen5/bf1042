import { useEffect, useState } from 'react'

export type AppRoute = '/' | '/search' | '/reorder' | '/recommendations'

const validRoutes: AppRoute[] = ['/', '/search', '/reorder', '/recommendations']

function normalize(pathname: string): AppRoute {
  return validRoutes.includes(pathname as AppRoute)
    ? (pathname as AppRoute)
    : '/'
}

export function navigate(to: AppRoute): void {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => normalize(window.location.pathname))

  useEffect(() => {
    const handleChange = () => {
      setRoute(normalize(window.location.pathname))
    }

    window.addEventListener('popstate', handleChange)
    return () => window.removeEventListener('popstate', handleChange)
  }, [])

  return route
}
