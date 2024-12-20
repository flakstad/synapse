import { useEffect, useRef } from 'react'
import { match } from 'path-to-regexp'
import { SignalItem, SignalTuple } from './types'

type RouteSignalConfig<E extends string> = {
  enter?: SignalItem<E>[]
  leave?: SignalItem<E>[]
}

export type RouteSignals<E extends string> = {
  [path: string]: RouteSignalConfig<E>
}

// Dispatch signals on entering and leaving specified url routes
export function useRouteSignals<E extends string>(
  routeSignals: RouteSignals<E>,
  emit: (
    signals: SignalItem<E>[] | SignalItem<E>,
    event?: Event | React.SyntheticEvent,
  ) => void,
) {
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    const handlePathChange = () => {
      const currentPath = window.location.pathname
      const prevPath = prevPathRef.current

      // Only proceed if the actual path has changed
      if (currentPath !== prevPath) {
        const handleSignals = (path: string, signalType: 'leave' | 'enter') => {
          for (const [routePath, config] of Object.entries(routeSignals)) {
            const matchFunction = match(routePath, { decode: decodeURIComponent })
            const result = matchFunction(path)

            if (result && config[signalType]) {
              const signals: SignalItem<E>[] = config[signalType].map((signal) => {
                if (typeof signal === 'string') {
                  return signal
                } else {
                  const [signalType, payload] = signal
                  if (typeof payload === 'string') {
                    return [signalType, payload] as SignalTuple<E>
                  } else {
                    return [signalType, { ...payload, params: result.params }] as SignalTuple<E>
                  }
                }
              })

              emit(signals)
              break
            }
          }
        }

        // Handle 'leave' signals for the previous path
        if (prevPath) {
          handleSignals(prevPath, 'leave')
        }

        // Handle 'enter' signals for the new path
        handleSignals(currentPath, 'enter')

        // Update the previous path reference
        prevPathRef.current = currentPath
      }
    }

    // Handle initial path
    handlePathChange()

    // Listen for navigation events
    window.addEventListener('popstate', handlePathChange)
    
    // Clean up listener
    return () => {
      window.removeEventListener('popstate', handlePathChange)
    }
  }, [routeSignals, emit])
}
