import { 
  synapse,
  RouteSignals,
  searchParamSync,
  localStorageSync,
  createSignalProcessor,
  type State,
} from '../src/index'
import { SignalHandlers } from '../src/types';

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
const SignalTypes = {
  PreventDefault: 'prevent_default',
  StopPropagation: 'stop_propagation',
  Focus: 'focus',
  ConsoleLog: 'console_log',
  UpdateStore: 'update_store',
  Search: 'search',
  SubscribeCollection: 'subscribe_collection',
  UnsubscribeCollection: 'unsubscribe_collection',
} as const

type MySignalTypeValues = (typeof SignalTypes)[keyof typeof SignalTypes]

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

const signalHandlers: SignalHandlers<MySignalTypeValues, State<AppState>> = {
  prevent_default: (state, signal, originalEvent) => originalEvent?.preventDefault(),
  stop_propagation: (state, signal, originalEvent) => originalEvent?.stopPropagation(),
  console_log: (state, signal) => console.log(signal.payload),
  focus: (state, signal, originalEvent) => {
    if (originalEvent?.target instanceof HTMLElement) {
      originalEvent.target.focus()
    }
  },
  update_store: (state, dataEvent) => {
    state.merge(dataEvent.payload || {})
  },
  search: (state, dataEvent) => {
    const { q } = dataEvent.payload || {}
    state.merge({ search: { q, a: undefined, loading: true } })
    searchQuery(q)
      .then((json) => {
        state.merge({ search: { q, a: json, loading: false } })
      })
      .catch((error) => {
        state.merge({ search: { q, loading: false, error: error } })
      })
  },
  subscribe_collection: (state, dataEvent) => {
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
        state.merge({ [collection]: data })
      },
      (error) => {
        console.error(`Error in ${collection} subscription:`, error)
      },
    )
  },
  unsubscribe_collection: (state, dataEvent) => {
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
const { emit, useSynapse, useRouteSignals } = synapse({
  initializers: [
    () => initialState,                          
    () => searchParamSync.load(searchParamsSyncedFields),                
    () => localStorageSync.load(localStorageSyncedFields)
  ],
  signalProcessor: createSignalProcessor(signalHandlers),
  listeners: [
    (state) => searchParamSync.update(state, searchParamsSyncedFields),    
    (state) => localStorageSync.update(state, localStorageSyncedFields)
  ]
})

// Defining route signals  - signals that will be emitted on entering and leaving routes
const routeSignals: RouteSignals<MySignalTypeValues> = {
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

export { emit, useSynapse, useRouteSignals, routeSignals }
