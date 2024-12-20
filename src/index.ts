import { EventBus } from './eventBus'
import { State } from './state'
import { useSynapseState } from './useSynapseState'
import { SignalItem, DataSignal, SignalProcessor, SignalPayload, SignalHandlers } from './types'
import { useRouteSignals, RouteSignals } from './useRouteSignals'
import * as searchParamSync from './searchParamSync'
import * as localStorageSync from './localStorageSync'
import { enableStoreAndEventDevTools } from './devTools'
import { unpackEvent } from './utils'

type SynapseConfig<S, E extends string> = {
  initializers: ((state: Partial<S>) => Partial<S>)[]
  signalProcessor: SignalProcessor<E, State<S>>
  listeners?: ((state: S) => void)[]
  enableDevTools?: boolean
}

function synapse<S, E extends string>({
  initializers,
  signalProcessor,
  listeners = [],
  enableDevTools = true
}: SynapseConfig<S, E>) {
  const initialState = initializers.reduce(
    (state, initializer) => ({
      ...state,
      ...initializer(state)
    }),
    {} as Partial<S>
  ) as S

  const synapse = new State<S>(initialState)
  const eventBus = new EventBus<E>()

  eventBus.setHandler((event: SignalItem<E>, originalEvent?: Event | React.SyntheticEvent) => {
    signalProcessor(synapse, unpackEvent(event), originalEvent)
  })

  listeners.forEach((listener) => {
    synapse.subscribe(() => {
      listener(synapse.get())
    })
  })

  const emit = (
    signals: SignalItem<E>[] | SignalItem<E>,
    event?: Event | React.SyntheticEvent,
  ) => {
    const signalArray = Array.isArray(signals) ? signals : [signals]
    eventBus.dispatch({ signals: signalArray, event: event })
  }

  if (enableDevTools) {
    enableStoreAndEventDevTools(emit, synapse)
  }

  return {
    emit,
    synapse,
    useSynapse: () => useSynapseState(synapse),
    useRouteSignals,
  }
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
}
