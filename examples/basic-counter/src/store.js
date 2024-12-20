import { synapse, createEventHandler } from '../../../src/index'

const initialState = () => ({
  count: 0,
  theme: 'light'
})

const eventHandler = createEventHandler({
  INCREMENT: (store) => {
    store.merge({ count: store.get().count + 1 })
  },
  
  DECREMENT: (store) => {
    store.merge({ count: store.get().count - 1 })
  },
  
  TOGGLE_THEME: (store) => {
    const currentTheme = store.get().theme
    store.merge({ theme: currentTheme === 'light' ? 'dark' : 'light' })
  }
})

export const { dispatch, useStore } = synapse({
  initializers: [initialState],
  eventHandler,
  listeners: [
    (state) => console.log('State updated:', state)
  ]
})