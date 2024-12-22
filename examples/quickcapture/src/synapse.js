import { synapse, createSignalProcessor, localStorageSync, searchParamSync } from '../../../src'
import { createSynapseHooks, withSignalHandlers } from '../../../src/react'

const defaultInitialState = {
  'notes.items': {},
  'theme.mode': 'dark',
  'capture.open': false,
  'capture.content': ''
}

export const synapseInstance = synapse({
  stateInitializers: [
    () => defaultInitialState,
    () => localStorageSync.load(['notes.items', 'theme.mode']),
    //() => searchParamSync.load(['capture.open']), 
  ],
  stateListeners: [
    (state) => localStorageSync.update(state, ['notes.items', 'theme.mode']),
    //(state) => searchParamSync.update(state, ['capture.open']),
  ],
  signalProcessor: createSignalProcessor({
    'theme.toggle': (state) => {
      const currentTheme = state.get()['theme.mode']
      state.merge({
        'theme.mode': currentTheme === 'light' ? 'dark' : 'light'
      })
    },
    'capture.open': (state) => {
      state.merge({ 'capture.open': true })
    },
    'capture.close': (state) => {
      state.merge({ 'capture.open': false })
    },
    'capture.content': (state, { payload }) => {
      state.merge({ 'capture.content': payload })
    },
    'notes.create': (state, { payload }) => {
      const id = Date.now().toString()
      const newNote = {
        id,
        content: payload.content,
        createdAt: new Date().toISOString()
      }
      const currentNotes = state.get()['notes.items']
      state.merge({ 
        'notes.items': { ...currentNotes, [id]: newNote },
        'capture.open': false,
        'capture.content': ''
      })
    },
    'notes.delete': (state, { payload }) => {
      const currentNotes = { ...state.get()['notes.items'] }
      delete currentNotes[payload.id]
      state.merge({ 'notes.items': currentNotes })
    }
  }),
  enableDevTools: true
})

export { withSignalHandlers }
export const { useSynapseState, useSignal } = createSynapseHooks(synapseInstance) 