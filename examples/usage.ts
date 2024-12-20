import { 
  synapse,
  EventHandlers,
  createEventHandler,
  RouteEvents,
  searchParamSync,
  localStorageSync
} from '../src/index'

// Define Subscription type
interface Subscription<T> {
  unsubscribe: () => void;
}

// Mock implementation of createSubscription
function createSubscription<T>(
  query: any,
  onData: (data: T) => void,
  onError: (error: any) => void
): Subscription<T> {
  // Simulate initial data fetch
  setTimeout(() => {
    onData([
      { id: 1, name: 'Mock Item 1' },
      { id: 2, name: 'Mock Item 2' },
    ] as T);
  }, 500);

  // Return mock unsubscribe function
  return {
    unsubscribe: () => {
      console.log('Unsubscribed from collection');
    },
  };
}

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
    const { collection, params } = dataEvent.payload
    const { workspaceId } = params
    console.log('handling event', 'subscribe_collection', dataEvent.payload)
    if (subscriptions[collection]) {
      console.warn(`Already subscribed to ${collection}. Unsubscribe first.`)
      return
    }

    const queryFunction = queryMap[collection]
    if (!queryFunction) {
      console.error(`No query function found for collection: ${collection}`)
      return
    }

    const query = queryFunction(workspaceId)

    subscriptions[collection] = createSubscription(
      query,
      (data) => {
        store.merge({ [collection]: data })
      },
      (error) => {
        console.error(`Error in ${collection} subscription:`, error)
      },
    )
  },
  unsubscribe_collection: (store, dataEvent) => {
    const { collection } = dataEvent.payload
    console.log('handling event', 'unsubscribe_collection', dataEvent.payload)
    if (subscriptions[collection]) {
      subscriptions[collection].unsubscribe()
      delete subscriptions[collection]
    }
  },
}

const localStorageSyncedFields = ['assets']
const searchParamsSyncedFields = ['search.q']

// Create the Synapse instance
const { dispatch, store, useStore, useRouteEvents } = synapse({
  initializers: [
    () => initialState,                          
    () => searchParamSync.load(searchParamsSyncedFields),                
    () => localStorageSync.load(localStorageSyncedFields)
  ],
  eventHandler: createEventHandler(eventHandlers),
  listeners: [
    (state) => searchParamSync.update(state, searchParamsSyncedFields),    
    (state) => localStorageSync.update(state, localStorageSyncedFields)
  ]
})

// Defining route events  - events that will be dispatched on routes
const routeEvents: RouteEvents<MyEventTypeValues> = {
  '/:workspaceId/search': {
    enter: [
      ['console_log', { text: 'Entered search!' }],
      ['subscribe_collection', { collection: 'assets' }],
    ],
    leave: [
      ['console_log', 'Left search!'],
      ['unsubscribe_collection', { collection: 'assets' }],
    ],
  },
}

export { dispatch, useStore, useRouteEvents, routeEvents }
