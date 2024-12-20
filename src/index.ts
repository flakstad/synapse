import { SignalBus } from './signalBus'
import { State } from './state'
import { DataSignal, SignalItem, RouteSignals, SignalProcessor, SignalPayload, SignalHandlers, SignalTuple } from './types'
import * as searchParamSync from './searchParamSync'
import * as localStorageSync from './localStorageSync'
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
  const signalBus = new SignalBus<E>()

  // Handle route signals if provided
  if (routeSignals) {
    let currentPath = window.location.pathname

    const handleRouteSignals = (path: string, signalType: 'leave' | 'enter') => {
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

          signalBus.dispatch({ signals })
          break
        }
      }
    }
    
    // Handle initial route
    setTimeout(() => {
      handleRouteSignals(currentPath, 'enter')
    }, 0)

    // Subscribe to path changes in state
    state.subscribe(() => {
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

  signalBus.setHandler((signal: SignalItem<E>, event?: Event) => {
    signalProcessor(state, unpack(signal), event)
  })

  stateListeners.forEach((listener) => {
    state.subscribe(() => {
      listener(state.get())
    })
  })

  const emit = (
    signals: SignalItem<E>[] | SignalItem<E>,
    event?: Event,
  ) => {
    const signalArray = Array.isArray(signals) && !Array.isArray(signals[0])
      ? [signals as SignalItem<E>]
      : Array.isArray(signals)
        ? signals
        : [signals]
    signalBus.dispatch({ signals: signalArray, event: event })
  }

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

// Export everything through a single API
export {
  // Main synapse function and its types
  synapse,
  type SynapseConfig,

  // Core types
  type State,

  // Route handling
  type RouteSignals,

  // Storage sync utilities
  searchParamSync,
  localStorageSync,

  // Signal handling
  createSignalProcessor,

  // Signal types
  type SignalItem,
  type DataSignal,
  type SignalProcessor,
  type SignalPayload,
}
