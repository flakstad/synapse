import { EventBus } from './eventBus'
import { Store } from './store'
import { useStore } from './useStore'
import { EventItem, DataEvent, EventItemHandler, EventPayload } from './types'
import { useRouteEvents, RouteEvents } from './useRouteEvents'
import * as searchParamSync from './searchParamSync'
import * as localStorageSync from './localStorageSync'
import { createEventHandler, type EventHandler, type EventHandlers } from './createEventHandler'
import { enableStoreAndEventDevTools } from './devTools'

type SynapseConfig<S, E extends string> = {
  initializers: ((state: Partial<S>) => Partial<S>)[]
  eventHandler: EventItemHandler<E, Store<S>>
  listeners?: ((state: S) => void)[]
  enableDevTools?: boolean
}

function unpackEvent<E extends string>(event: EventItem<E>): DataEvent<E> {
  if (Array.isArray(event)) {
    const [type, payload] = event
    return { type, payload }
  } else {
    return { type: event }
  }
}

function synapse<S, E extends string>({
  initializers,
  eventHandler,
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

  const store = new Store<S>(initialState)
  const eventBus = new EventBus<E>()

  eventBus.setHandler((event: EventItem<E>, originalEvent?: Event | React.SyntheticEvent) => {
    const dataEvent = unpackEvent(event)
    eventHandler(store, dataEvent, originalEvent)
  })

  listeners.forEach((listener) => {
    store.subscribe(() => {
      listener(store.get())
    })
  })

  const dispatch = (
    events: EventItem<E>[] | EventItem<E>,
    originalEvent?: Event | React.SyntheticEvent,
  ) => {
    const eventArray = Array.isArray(events) ? events : [events]
    eventBus.dispatch({ events: eventArray, originalEvent })
  }

  if (enableDevTools) {
    enableStoreAndEventDevTools(dispatch, store)
  }

  return {
    dispatch,
    store,
    useStore: () => useStore(store),
    useRouteEvents,
  }
}

// Export everything through a single API
export {
  // Main synapse function and its types
  synapse,
  type SynapseConfig,
  
  // Core types
  type Store,
  type EventItem,
  type DataEvent,
  type EventItemHandler,
  type EventPayload,
  
  // Route handling
  type RouteEvents,
  useRouteEvents,
  
  // Storage sync utilities
  searchParamSync,
  localStorageSync,
  
  // Event handling
  createEventHandler,
  type EventHandler,
  type EventHandlers,
}