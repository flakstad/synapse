import React from 'react'
import { useSynapseState } from './synapse'
import { NotesList } from './components/NotesList'
import { styles } from './styles'

export default function $App() {
  const theme = useSynapseState(state => state['theme.mode'])
  
  return (
    <div style={styles.container(theme)}>
      <h1>QuickCapture</h1>
      <NotesList />
    </div>
  )
} 