import React, { useEffect } from 'react'
import { useSynapseState, useSignal, withSignalHandlers } from '../synapse'
import { styles } from '../styles'
import { Button } from './Button'

export const CaptureWindowView = ({ isOpen, content, theme, onContentChange, onSave, onCancel }) => {
  if (!isOpen) return null

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent(theme)}>
        <h2>Capture Note</h2>
        <textarea
          value={content || ''}
          onChange={(e) => onContentChange(e.target.value)}
          style={styles.noteTextarea}
          autoFocus
          placeholder="What's on your mind?"
        />
        <div style={styles.modalButtons}>
          <Button
            onClick={onSave}
            disabled={!content?.trim()}
            style={styles.saveButton}
          >
            Save
          </Button>
          <Button
            onClick={onCancel}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export const CaptureWindow = () => {
  const isOpen = useSynapseState(state => state['capture.open'])
  const content = useSynapseState(state => state['capture.content'])
  const theme = useSynapseState(state => state['theme.mode'])
  const emit = useSignal()

  useEffect(() => {
    if (!isOpen) {
      emit(['capture.content', ''])
    }
  }, [isOpen, emit])

  return (
    <CaptureWindowView
      isOpen={isOpen}
      content={content}
      theme={theme}
      onContentChange={(value) => emit(['capture.content', value])}
      onSave={['notes.create', { content }]}
      onCancel="capture.close"
    />
  )
} 