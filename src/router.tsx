import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { NotFound } from './components/NotFound'
import { RouteError } from './components/RouteError'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Without these two, an unmatched URL or a throwing route renders nothing —
    // a blank page that reads as a broken site rather than a missing one.
    defaultNotFoundComponent: NotFound,
    defaultErrorComponent: RouteError,
  })

  return router
}
