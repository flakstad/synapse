// useRouteEvents.ts
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { match } from 'path-to-regexp'
import { EventItem, EventTuple } from './types'

type RouteEventConfig<E extends string> = {
  enter?: EventItem<E>[]
  leave?: EventItem<E>[]
}

export type RouteEvents<E extends string> = {
  [path: string]: RouteEventConfig<E>
}

// Dispatch events on entering and leaving specified url routes
export function useRouteEvents<E extends string>(
  routeEvents: RouteEvents<E>,
  dispatch: (
    events: EventItem<E>[] | EventItem<E>,
    originalEvent?: Event | React.SyntheticEvent,
  ) => void,
) {
  const location = useLocation()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    const currentPath = location.pathname
    const prevPath = prevPathRef.current

    // Only proceed if the actual path has changed
    if (currentPath !== prevPath) {
      const handleEvents = (path: string, eventType: 'leave' | 'enter') => {
        for (const [routePath, config] of Object.entries(routeEvents)) {
          const matchFunction = match(routePath, { decode: decodeURIComponent })
          const result = matchFunction(path)

          if (result && config[eventType]) {
            const events: EventItem<E>[] = config[eventType].map((event) => {
              if (typeof event === 'string') {
                return event
              } else {
                const [eventType, payload] = event
                if (typeof payload === 'string') {
                  return [eventType, payload] as EventTuple<E>
                } else {
                  return [eventType, { ...payload, params: result.params }] as EventTuple<E>
                }
              }
            })

            dispatch(events)
            break
          }
        }
      }

      // Handle 'leave' events for the previous path
      if (prevPath) {
        handleEvents(prevPath, 'leave')
      }

      // Handle 'enter' events for the new path
      handleEvents(currentPath, 'enter')

      // Update the previous path reference
      prevPathRef.current = currentPath
    }
  }, [location.pathname, routeEvents, dispatch])
}
