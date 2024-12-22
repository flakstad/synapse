import React from 'react'
import { useSynapseState, useSignal } from '../synapse'
import { styles } from '../styles'

export const NotesList = () => {
  const notes = useSynapseState(state => state['notes.items'])
  const theme = useSynapseState(state => state['theme.mode'])
  const emit = useSignal()

  return (
    <div style={styles.notesList}>
      {notes.length === 0 ? (
        <p>No notes yet. Start capturing!</p>
      ) : (
        notes.map(note => (
          <div key={note.id} style={styles.noteItem}>
            <p>{note.content}</p>
            <div style={styles.noteMetadata}>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              <button
                onClick={() => emit(['notes.delete', { id: note.id }])}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
      
      <div style={styles.themeToggle}>
        <button
          onClick={() => emit('theme.toggle')}
          style={styles.toggleButton}
        >
          Toggle Theme ({theme})
        </button>
      </div>
    </div>
  )
} 