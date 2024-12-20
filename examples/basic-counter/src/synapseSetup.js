import { synapse, createSignalProcessor } from '../../../src/index'

const initialState = () => ({
  count: 0,
  theme: 'light'
})

const signalProcessor = createSignalProcessor({
  INCREMENT: (state) => {
    state.merge({ count: state.get().count + 1 })
  },
  
  DECREMENT: (state) => {
    state.merge({ count: state.get().count - 1 })
  },
  
  TOGGLE_THEME: (state) => {
    const currentTheme = state.get().theme
    state.merge({ theme: currentTheme === 'light' ? 'dark' : 'light' })
  }
})

export const { emit, useSynapse } = synapse({
  initializers: [initialState],
  signalProcessor,
  listeners: [
    (state) => console.log('State updated:', state)    
  ]
})