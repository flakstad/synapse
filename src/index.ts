import { EventBus } from './eventBus'
import { Store } from './store'
import { useStore } from './useStore'
import { EventItem, DataEvent, EventItemHandler, EventPayload } from './types'
import { useRouteEvents, RouteEvents } from './useRouteEvents'
import { createSubscription, Subscription, SubscriptionStatus } from './createSubscription'
import * as searchParamSync from './searchParamSync'
import * as localStorageSync from './localStorageSync'
import { createEventHandler, type EventHandler, type EventHandlers } from './createEventHandler'
import { enableStoreAndEventDevTools } from './devTools'

type SynapseConfig<S, E extends string> = {
  initialState: S
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
  initialState,
  eventHandler,
  listeners = [],
  enableDevTools = true
}: SynapseConfig<S, E>) {
  const urlState = searchParamSync.load()
  const localStorageState = localStorageSync.load()
  const mergedInitialState = { ...initialState, ...localStorageState, ...urlState } as S

  const store = new Store<S>(mergedInitialState)
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
  
  // Subscription handling
  createSubscription,
  type Subscription,
  type SubscriptionStatus,
  
  // Storage sync utilities
  searchParamSync,
  localStorageSync,
  
  // Event handling
  createEventHandler,
  type EventHandler,
  type EventHandlers,
}

// TODO: event handler should take actions and call an actions handler that computes the store updates and side effects. The event handler then updates the store and performs effects.
// TODO: storage layer should have sync to localStorage/indexedDB. Define keys which should be persisted.
// TODO: typed store, or fully dynamic?
