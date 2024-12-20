import { 
  synapse,
  EventHandlers,
  createEventHandler,
  RouteEvents,
  createSubscription,
  Subscription,
  searchParamSync,
  localStorageSync
} from '../src/index'

// Define the app state schema
export interface AppState {
  search: {
    q: string
    a?: any
    loading: boolean
    error?: any
  }
}

// Define initial state
const initialState: AppState = {
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

const subscriptions: { [key: string]: Subscription<any> } = {}

// mapping subscribe_collection collectionNames to firestore query implementations
const queryMap: { [key: string]: (workspaceId: string) => any } = {
  assets: () => 1,
  documents: () => 2
  // ..other collection queries..
}

const searchQuery = (q: string): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        results: [
          { id: 1, title: `Mock result 1 for "${q}"` },
          { id: 2, title: `Mock result 2 for "${q}"` }
        ]
      });
    }, 500); // Simulate network delay
  });
};

const eventHandlers: EventHandlers<AppState, MyEventTypeValues> = {
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
    const { q } = dataEvent.payload || {}
    store.merge({ search: { q, a: undefined, loading: true } })
    searchQuery(q)
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

// Create the Synapse instance
const { dispatch, store, useStore, useRouteEvents } = synapse({
  initialState,
  eventHandler: createEventHandler<AppState, MyEventTypeValues>(eventHandlers),
  listeners: [
    (state) => searchParamSync.update(state),
    (state) => localStorageSync.update(state)
  ],
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
