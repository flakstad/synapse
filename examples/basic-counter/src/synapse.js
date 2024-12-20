import { synapse, createSignalProcessor, searchParamSync, localStorageSync } from '../../../src/index'
import { createSynapseHooks } from '../../../src/react'

const defaultInitialState = {
  'counter.value': 0,
  'theme.mode': 'light',
  'nav.path': "/",
  'profile.subscription': null,
  'profile.name': null,
  'profile.lastActive': null
}

// Suggested naming convention for signals and state keys:
// nav.* for navigation-related actions
// sys.* for system-level operations
// state.* for state management operations
// dom.* for DOM-related operations (e.g., dom.preventDefault, dom.scroll)
// ui.* for UI-specific state (e.g., ui.loading, ui.modal)
// app.* for application-level operations
// evt.* for event-related operations
// api.* for API-related operations

export const synapseInstance = synapse({
  stateInitializers: [
    () => (defaultInitialState),
    () => localStorageSync.load(['counter.value', 'theme.mode', 'profile.name', 'profile.lastActive']),
    () => searchParamSync.load(['counter.value', 'nav.path']),      
  ],
  stateListeners: [
    //(state) => console.log('State updated:', state),
    (state) => localStorageSync.update(state, ['counter.value', 'theme.mode', 'profile.name', 'profile.lastActive']),       
    (state) => searchParamSync.update(state, ['counter.value', 'nav.path']),
  ],
  signalProcessor: createSignalProcessor({
    'counter.increment': (state) => {
      state.merge({ 'counter.value': Number(state.get()['counter.value']) + 1 })
    },
    'counter.decrement': (state) => {
      state.merge({ 'counter.value': Number(state.get()['counter.value']) - 1 })
    },
    'theme.toggle': (state) => {
      const currentTheme = state.get()['theme.mode']
      state.merge({ 'theme.mode': currentTheme === 'light' ? 'dark' : 'light' })        
    },
    'nav.to': (state, { payload }) => {
      const path = payload?.path || '/'
      window.history.pushState(null, '', path)
      state.merge({ 'nav.path': path })
    },
    'sys.log': (state, { payload }, event) => {
      console.log(payload, event)
    },
    'state.reset': (state) => {
      state.reset(defaultInitialState)
    },
    'profile.startSubscription': (state) => {
      const intervalId = setInterval(() => {
        state.merge({
          'profile.name': 'John Doe',
          'profile.lastActive': new Date().toISOString()
        })        
      }, 1000)
      state.merge({ 'profile.subscription': intervalId })
    },
    'profile.stopSubscription': (state) => {
      const intervalId = state.get()['profile.subscription']
      if (intervalId) {
        clearInterval(intervalId)
        state.merge({ 'profile.subscription': null })
      }
    },  
  }),  
  enableDevTools: true,
  routeSignals: {
    '/': {
      enter: [['sys.log', { message: 'Entered home page' }]],
      leave: [['sys.log', { message: 'Left home page' }]]
    },
    '/counter': {
      enter: [['sys.log', { message: 'Entered counter page' }]],
      leave: [['sys.log', { message: 'Left counter page' }]]
    },
    '/profile': {
      enter: [
        ['sys.log', { message: 'Entered profile page, starting subscription' }],
        ['profile.startSubscription']
      ],
      leave: [
        ['sys.log', { message: 'Left profile page, stopping subscription' }],
        ['profile.stopSubscription'],        
      ]
    }
  },
  pathSelector: (state) => state['nav.path']
})

// Export hooks for convenience
export const { useSynapseState, useSignal, withSignalHandlers } = createSynapseHooks(synapseInstance)
