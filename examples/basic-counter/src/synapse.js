import { synapse, createSignalProcessor, searchParamSync, localStorageSync } from '../../../src/index'
import { createSynapseHooks } from '../../../src/react'

const defaultInitialState = {
  'counter.value': 0,
  'theme.mode': 'light',
  'navigation.path': "/",
  'profile.subscription': null,
  'profile.name': null,
  'profile.lastActive': null
}

export const synapseInstance = synapse({
  stateInitializers: [
    () => (defaultInitialState),
    () => localStorageSync.load(['counter.value', 'theme.mode', 'profile.name', 'profile.lastActive']),
    () => searchParamSync.load(['counter.value', 'theme.mode', 'navigation.path']),      
  ],
  stateListeners: [
    (state) => console.log('State updated:', state),
    (state) => localStorageSync.update(state, ['counter.value', 'theme.mode', 'profile.name', 'profile.lastActive']),       
    (state) => searchParamSync.update(state, ['counter.value', 'theme.mode', 'navigation.path']),
  ],
  signalProcessor: createSignalProcessor({
    'counter.increment': (state) => {
      state.merge({ 'counter.value': Number(state.get()['counter.value']) + 1 })
    },
    'counter.decrement': (state) => {
      state.swap(val => ({ ...val, 'counter.value': Number(val['counter.value']) - 1 }))
    },
    'theme.toggle': (state) => {
      const currentTheme = state.get()['theme.mode']
      state.merge({ 'theme.mode': currentTheme === 'light' ? 'dark' : 'light' })        
    },
    'navigation.navigate': (state, { payload }) => {
      const path = payload?.path || '/'
      window.history.pushState(null, '', path)
      state.merge({ 'navigation.path': path })
    },
    'system.log': (state, { payload }, event) => {
      console.log(payload, event)
    },
    'system.reset': (state) => {
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
      enter: [['system.log', { message: 'Entered home page' }]],
      leave: [['system.log', { message: 'Left home page' }]]
    },
    '/counter': {
      enter: [['system.log', { message: 'Entered counter page' }]],
      leave: [['system.log', { message: 'Left counter page' }]]
    },
    '/profile': {
      enter: [
        ['system.log', { message: 'Entered profile page, starting subscription' }],
        ['profile.startSubscription']
      ],
      leave: [
        ['system.log', { message: 'Left profile page, stopping subscription' }],
        ['profile.stopSubscription'],        
      ]
    }
  },
  pathSelector: (state) => state['navigation.path']
})

// Export hooks for convenience
export const { useSynapseState, useSignal, withSignalHandlers } = createSynapseHooks(synapseInstance)
