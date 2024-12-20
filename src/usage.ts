/* eslint-disable no-console */
// usage.ts
import { System } from '../types'
import { synapse, Store, DataEvent } from './synapse'
import { search as searchQuery } from './../queries'
import { RouteEvents } from './useRouteEvents'
import { Query } from 'firebase/firestore'
import * as firestoreQueries from '../firestore'
import { createSubscription, Subscription } from './createSubscription'
import { update as updateSearchParams } from './searchParamSync'
import { update as updateLocalStorage } from './localStorageSync'

// Define the app state schema
export interface AppState {
  workspaceId: string
  search: {
    q: string
    a?: System.SearchResult
    loading: boolean
    error?: any
  }
  assets?: System.Asset[]
}

// Define initial state
const initialState: AppState = {
  workspaceId: '',
  search: { q: '', loading: false },
}

// Define event types
const EventType = {
  PreventDefault: 'prevent_default',
  StopPropagation: 'stop_propagation',
  Focus: 'focus',
  ConsoleLog: 'console_log',
  UpdateStore: 'update_store',
  Search: 'search',
  SubscribeCollection: 'subscribe_collection',
  UnsubscribeCollection: 'unsubscribe_collection',
} as const

type MyEventTypeValues = (typeof EventType)[keyof typeof EventType]

// Define a type for the event handler function
type EventHandler<T extends MyEventTypeValues> = (
  store: Store<AppState>,
  dataEvent: DataEvent<T>,
  originalEvent?: Event | React.SyntheticEvent,
) => void

type EventHandlers = {
  [K in MyEventTypeValues]: EventHandler<K>
}

const subscriptions: { [key: string]: Subscription<any> } = {}

// mapping subscribe_collection collectionNames to firestore query implementations
const queryMap: { [key: string]: (workspaceId: string) => Query<any> } = {
  assets: firestoreQueries.assetsQuery,
  documents: firestoreQueries.documentsQuery,
  // TODO: add other collection queries..
}

const eventHandlers: EventHandlers = {
  prevent_default: (store, dataEvent, originalEvent) => originalEvent?.preventDefault(),
  stop_propagation: (store, dataEvent, originalEvent) => originalEvent?.stopPropagation(),
  console_log: (store, dataEvent) => console.log(dataEvent.payload),
  focus: (store, dataEvent, originalEvent) => {
    if (originalEvent?.target instanceof HTMLElement) {
      originalEvent.target.focus()
    }
  },
  update_store: (store, dataEvent) => {
    store.merge(dataEvent.payload || {})
  },
  search: (store, dataEvent) => {
    const { workspaceId, q } = dataEvent.payload || {}
    store.merge({ search: { q, a: undefined, loading: true } })
    searchQuery(workspaceId, q)
      .then((json) => {
        store.merge({ search: { q, a: json, loading: false } })
      })
      .catch((error) => {
        store.merge({ search: { q, loading: false, error: error } })
      })
  },
  subscribe_collection: (store, dataEvent) => {
    const { collectionName, params } = dataEvent.payload
    const { workspaceId } = params
    console.log('handling event', 'subscribe_collection', dataEvent.payload)
    if (subscriptions[collectionName]) {
      console.warn(`Already subscribed to ${collectionName}. Unsubscribe first.`)
      return
    }

    const queryFunction = queryMap[collectionName]
    if (!queryFunction) {
      console.error(`No query function found for collection: ${collectionName}`)
      return
    }

    const query = queryFunction(workspaceId)

    subscriptions[collectionName] = createSubscription(
      query,
      (data) => {
        store.merge({ [collectionName]: data })
      },
      (error) => {
        console.error(`Error in ${collectionName} subscription:`, error)
      },
    )
  },
  unsubscribe_collection: (store, dataEvent) => {
    const { collectionName } = dataEvent.payload
    console.log('handling event', 'unsubscribe_collection', dataEvent.payload)
    if (subscriptions[collectionName]) {
      subscriptions[collectionName].unsubscribe()
      delete subscriptions[collectionName]
    }
  },
}

function createEventHandler<T extends MyEventTypeValues>(
  handlers: EventHandlers,
): (
  store: Store<AppState>,
  event: DataEvent<T>,
  originalEvent?: Event | React.SyntheticEvent,
) => void {
  return (store, event, originalEvent) => {
    const handler = handlers[event.type] as EventHandler<T>
    handler(store, event, originalEvent)
  }
}

// Create the Synapse instance, from an initial app state, an event handler and data store listeners.
// Returns
//   dispatch - send events
//   store - access the data store
//   useStore - hook for the data store, returns updated store on every change
//   useRouteEvents - hook to register events to dispatch on specific routes
const { dispatch, store, useStore, useRouteEvents } = synapse({
  initialState,
  eventHandler: createEventHandler<MyEventTypeValues>(eventHandlers),
  listeners: [(state) => updateSearchParams(state), (state) => updateLocalStorage(state)],
})

// Defining route events  - events that will be dispatched on routes
const routeEvents: RouteEvents<MyEventTypeValues> = {
  '/:workspaceId/search': {
    enter: [
      ['console_log', { text: 'Entered search!' }],
      ['subscribe_collection', { collectionName: 'assets' }],
    ],
    leave: [
      ['console_log', 'Left search!'],
      ['unsubscribe_collection', { collectionName: 'assets' }],
    ],
  },
}

// Exposing dispatch and store to the window object, allowing inspection/interaction in the browser console.
declare global {
  interface Window {
    Synapse: {
      dispatch: typeof dispatch
      store: typeof store
    }
  }
}

window.Synapse = {
  dispatch,
  store,
}

export { dispatch, useStore, useRouteEvents, routeEvents }
