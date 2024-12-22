import React from 'react'
import { useSynapseState, useSignal, withSignalHandlers } from '../synapse'
import { styles } from '../styles'
import { Button } from './Button'

export const CapturesView = ({ notes, theme, onDeleteNote }) => {
  const notesList = Object.values(notes)

  return (
    <div style={styles.notesList}>
      {notesList.length === 0 ? (
        <p>No notes yet. Start capturing!</p>
      ) : (
        notesList.map(note => (
          <div key={note.id} style={styles.noteItem(theme)}>
            <p>{note.content}</p>
            <div style={styles.noteMetadata(theme)}>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              <Button
                onClick={() => onDeleteNote(note.id)}
                style={styles.deleteButton}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      )}            
    </div>
  )
}

export const Captures = () => {
  const notes = useSynapseState(state => state['notes.items'])
  const theme = useSynapseState(state => state['theme.mode'])

  return (
    <CapturesView
      notes={notes}
      theme={theme}
      onDeleteNote={(id) => ['notes.delete', { id }]}
      onToggleTheme="theme.toggle"
    />
  )
} 