// synapse.ts
import { EventBus } from './eventBus'
import { Store } from './store'
import { useStore } from './useStore'
import { EventItem, DataEvent, EventItemHandler, EventPayload } from './types'
import { useRouteEvents } from './useRouteEvents'
import { load as loadSearchParamsState } from './searchParamSync'
import { load as loadLocalStorageState } from './localStorageSync'

export type SynapseConfig<S, E extends string> = {
  initialState: S
  eventHandler: EventItemHandler<E, Store<S>>
  listeners?: ((state: S) => void)[]
}

function unpackEvent<E extends string>(event: EventItem<E>): DataEvent<E> {
  if (Array.isArray(event)) {
    const [type, payload] = event
    return { type, payload }
  } else {
    return { type: event }
  }
}

export function synapse<S, E extends string>({
  initialState,
  eventHandler,
  listeners = [],
}: SynapseConfig<S, E>) {
  const urlState = loadSearchParamsState()
  const localStorageState = loadLocalStorageState()
  const mergedInitialState = { ...initialState, ...localStorageState, ...urlState } as S

  const store = new Store<S>(mergedInitialState)
  const eventBus = new EventBus<E>()

  eventBus.setHandler((event: EventItem<E>, originalEvent?: Event | React.SyntheticEvent) => {
    const dataEvent = unpackEvent(event)
    eventHandler(store, dataEvent, originalEvent)
  })

  // Set up listeners
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

  return {
    dispatch,
    store,
    useStore: () => useStore(store),
    useRouteEvents,
  }
}

export type { EventItem, DataEvent, Store, EventPayload }

// TODO: event handler should take actions and call an actions handler that computes the store updates and side effects. The event handler then updates the store and performs effects.
// TODO: storage layer should have sync to localStorage/indexedDB. Define keys which should be persisted.
// TODO: typed store, or fully dynamic?
