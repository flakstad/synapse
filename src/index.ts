import { SignalBus } from './signalBus'
import { State } from './state'
import { SignalItem, DataSignal, SignalProcessor, SignalPayload, SignalHandlers } from './types'
import { useRouteSignals, RouteSignals } from './useRouteSignals'
import * as searchParamSync from './searchParamSync'
import * as localStorageSync from './localStorageSync'
import { enableSynapseDevTools } from './devTools'
import { unpack } from './utils'
import { useRef } from 'react'

type SynapseConfig<S, E extends string> = {
  initializers: ((state: Partial<S>) => Partial<S>)[]
  signalProcessor: SignalProcessor<E, State<S>>
  stateListeners?: ((state: S) => void)[]
  enableDevTools?: boolean
  routeSignals?: RouteSignals<E>
  pathSelector?: (state: S) => string
}

function synapse<S, E extends string>({
  initializers,
  signalProcessor,
  stateListeners = [],
  enableDevTools = true,
  routeSignals,
  pathSelector,
}: SynapseConfig<S, E>) {
  const initialState = initializers.reduce(
    (state, initializer) => ({
      ...state,
      ...initializer(state)
    }),
    {} as Partial<S>
  ) as S

  const synapseState = new State<S>(initialState)
  const signalBus = new SignalBus<E>()

  // Handle route signals if provided
  if (routeSignals) {
    let currentPath = window.location.pathname
    
    // Move initial route handling to after state initialization
    setTimeout(() => {
      const initialRoute = routeSignals[currentPath]
      if (initialRoute?.enter) {
        signalBus.dispatch({ signals: initialRoute.enter })
      }
    }, 0)

    // Subscribe to path changes in state
    synapseState.subscribe(() => {
      const newPath = pathSelector 
        ? pathSelector(synapseState.get())
        : window.location.pathname
      if (newPath !== currentPath) {
        const prevRoute = routeSignals[currentPath]
        const nextRoute = routeSignals[newPath]

        if (prevRoute?.leave) {
          signalBus.dispatch({ signals: prevRoute.leave })
        }
        if (nextRoute?.enter) {
          signalBus.dispatch({ signals: nextRoute.enter })
        }
        
        currentPath = newPath
      }
    })
  }

  signalBus.setHandler((signal: SignalItem<E>, event?: Event | React.SyntheticEvent) => {
    signalProcessor(synapseState, unpack(signal), event)
  })

  stateListeners.forEach((listener) => {
    synapseState.subscribe(() => {
      listener(synapseState.get())
    })
  })

  const emit = (
    signals: SignalItem<E>[] | SignalItem<E>,
    event?: Event | React.SyntheticEvent,
  ) => {
    const signalArray = Array.isArray(signals) && !Array.isArray(signals[0])
      ? [signals as SignalItem<E>]
      : Array.isArray(signals)
        ? signals
        : [signals]
    signalBus.dispatch({ signals: signalArray, event: event })
  }

  if (enableDevTools) {
    enableSynapseDevTools(emit, synapseState)
  }

  return { synapseState, emit }
}

function useSynapse<S, E extends string>(config: SynapseConfig<S, E>) {
  const synapseRef = useRef<ReturnType<typeof synapse<S, E>> | null>(null)
  
  if (!synapseRef.current) {
    synapseRef.current = synapse(config)
  }
  
  if (config.routeSignals) {
    useRouteSignals(config.routeSignals, synapseRef.current.emit)
  }
  
  return { emit: synapseRef.current.emit }
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
  useRouteSignals,

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

  // New hook that handles both initialization and state management
  useSynapse,
}
