import { State } from './state'
import { DataSignal, SignalItem, RouteSignals, SignalProcessor, SignalPayload, SignalHandlers, SignalTuple } from './types'
import { enableSynapseDevTools } from './devTools'
import { unpack } from './utils'
import { match } from 'path-to-regexp'

type SynapseConfig<S, E extends string> = {
  stateInitializers: ((state: Partial<S>) => Partial<S>)[]
  signalProcessor: SignalProcessor<E, State<S>>
  stateListeners?: ((state: S) => void)[]
  enableDevTools?: boolean
  routeSignals?: RouteSignals<E>
  pathSelector?: (state: S) => string
  selectors?: {
    [K: string]: (state: S) => any
  }
}

function synapse<S, E extends string>({
  stateInitializers,
  signalProcessor,
  stateListeners = [],
  enableDevTools = true,
  routeSignals,
  pathSelector,
  selectors = {},
}: SynapseConfig<S, E>) {
  const initialState = stateInitializers.reduce(
    (state, initializer) => ({
      ...state,
      ...initializer(state)
    }),
    {} as Partial<S>
  ) as S

  const state = new State<S>(initialState)    

  const emit = (
    signals: SignalItem<E>[] | SignalItem<E>,
    event?: Event,
  ) => {
    const signalArray = Array.isArray(signals) && !Array.isArray(signals[0])
      ? [signals as SignalItem<E>]
      : Array.isArray(signals)
        ? signals
        : [signals]
    signalArray.forEach(signal => signalProcessor(state, unpack(signal), event)
    )
  }

  if (routeSignals) {
    let currentPath = window.location.pathname
    let isInitialLoad = true
    let isHandlingRouteSignal = false

    const handleRouteSignals = (path: string, signalType: 'leave' | 'enter') => {
      isHandlingRouteSignal = true
      for (const [routePath, config] of Object.entries(routeSignals)) {
        const matchFunction = match(routePath, { decode: decodeURIComponent })
        const result = matchFunction(path)

        if (result && config[signalType]) {
          const signals = config[signalType].map((signal): SignalItem<E> => {
            if (typeof signal === 'string') {
              return signal as E
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
      isHandlingRouteSignal = false
    }
    
    setTimeout(() => {
      handleRouteSignals(currentPath, 'enter')
      isInitialLoad = false
    }, 0)

    state.subscribe(() => {
      if (isInitialLoad || isHandlingRouteSignal) return
      
      const newPath = pathSelector 
        ? pathSelector(state.get())
        : window.location.pathname
        
      if (newPath !== currentPath) {
        handleRouteSignals(currentPath, 'leave')
        handleRouteSignals(newPath, 'enter')
        currentPath = newPath
      }
    })
  }

  stateListeners.forEach((listener) => {
    state.subscribe(() => {
      listener(state.get())
    })
  })

  if (enableDevTools) {
    enableSynapseDevTools(emit, state)
  }

  const select = <T>(selectorKey: string) => {
    const selector = selectors[selectorKey]
    if (!selector) throw new Error(`Selector ${selectorKey} not found`)
    return selector(state.get())
  }

  return { state, emit, select }
}

function createSignalProcessor<S, T extends string>(
  handlers: SignalHandlers<T, S>,
): SignalProcessor<T, S> {
  return (state, signal, event) => {
    const handler = handlers[signal.type] as SignalProcessor<T, S>
    handler(state, signal, event)
  }
}

const createKey = (namespace: string, key: string) => `${namespace}.${key}`
const parseKey = (fullKey: string) => {
  const [namespace, ...rest] = fullKey.split('.')
  return { namespace, key: rest.join('.') }
}

// Helper to check if a key is already in dot notation
const isDotNotation = (key: string) => key.includes('.')

// Helper to ensure dot notation
const ensureDotNotation = (key: string | StorageConfig) => {
  if (typeof key === 'string') {
    return isDotNotation(key) ? key : `default.${key}`
  }
  return createKey(key.namespace, key.key)
}

type StorageKey = string | StorageConfig

const searchParamSync = {
  load: (keys: StorageKey[]) => {
    const params = new URLSearchParams(window.location.search)
    return keys.reduce((acc, key) => {
      const fullKey = ensureDotNotation(key)
      const value = params.get(fullKey.replace('.', '--'))
      if (value !== null) {
        acc[fullKey] = value
      }
      return acc
    }, {} as Record<string, any>)
  },
  update: (state: any, keys: StorageKey[]) => {
    const params = new URLSearchParams(window.location.search)
    keys.forEach(key => {
      const fullKey = ensureDotNotation(key)
      const value = state[fullKey]
      if (value !== undefined) {
        params.set(fullKey.replace('.', '--'), String(value))
      } else {
        params.delete(fullKey.replace('.', '--'))
      }
    })
    const newSearch = params.toString()
    const newUrl = `${window.location.pathname}${newSearch ? '?' + newSearch : ''}`
    window.history.replaceState(null, '', newUrl)
  }
}

const localStorageSync = {
  load: (keys: StorageKey[]) => {
    return keys.reduce((acc, key) => {
      const fullKey = ensureDotNotation(key)
      const value = localStorage.getItem(fullKey.replace('.', '--'))
      if (value !== null) {
        try {
          acc[fullKey] = JSON.parse(value)
        } catch {
          acc[fullKey] = value
        }
      }
      return acc
    }, {} as Record<string, any>)
  },
  update: (state: any, keys: StorageKey[]) => {
    keys.forEach(key => {
      const fullKey = ensureDotNotation(key)
      const value = state[fullKey]
      if (value !== undefined) {
        localStorage.setItem(fullKey.replace('.', '--'), JSON.stringify(value))
      } else {
        localStorage.removeItem(fullKey.replace('.', '--'))
      }
    })
  }
}

type StorageConfig = {
  namespace: string
  key: string
}

// Export everything through a single API
export {
  synapse,
  type SynapseConfig,
  type State,
  type RouteSignals,
  searchParamSync,
  localStorageSync,
  createSignalProcessor,
  type SignalItem,
  type DataSignal,
  type SignalProcessor,
  type SignalPayload,
}
