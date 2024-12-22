import { synapse, createSignalProcessor } from '../../../src'
import { createSynapseHooks } from '../../../src/react'

const defaultInitialState = {
  'notes.items': [],
  'notes.loading': false,
  'theme.mode': 'dark'
}

export const synapseInstance = synapse({
  stateInitializers: [
    () => defaultInitialState,
  ],
  signalProcessor: createSignalProcessor({
    'notes.add': (state, { payload }) => {
      const newNote = {
        id: crypto.randomUUID(),
        content: payload.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const currentNotes = state.get()['notes.items']
      state.merge({ 'notes.items': [newNote, ...currentNotes] })
    },
    'notes.delete': (state, { payload }) => {
      const currentNotes = state.get()['notes.items']
      state.merge({
        'notes.items': currentNotes.filter(note => note.id !== payload.id)
      })
    },
    'theme.toggle': (state) => {
      const currentTheme = state.get()['theme.mode']
      state.merge({
        'theme.mode': currentTheme === 'light' ? 'dark' : 'light'
      })
    }
  }),
  enableDevTools: true
})

export const { useSynapseState, useSignal } = createSynapseHooks(synapseInstance) 