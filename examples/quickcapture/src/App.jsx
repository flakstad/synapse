import { useEffect } from 'react'
import { useSynapseState, useSignal, withSignalHandlers } from './synapse'
import { Captures } from './components/Captures'
import { styles } from './styles'
import { CaptureWindow } from './components/CaptureWindow'
import { Button } from './components/Button'

// View component
export const AppView = ({ theme, onNew, onToggleTheme }) => {
  return (
    <div style={styles.container(theme)}>
      <h1>quickcapture</h1>
      <Button onClick={onNew} style={styles.captureButton}>
        New
      </Button>
      <Captures />
      <CaptureWindow />
      <div style={styles.themeToggle}>
        <Button
          onClick={onToggleTheme}
          style={styles.toggleButton}
        >
          Toggle Theme ({theme})
        </Button>
      </div>
    </div>
  )
}

// Provider component
export const App = () => {
  const theme = useSynapseState(state => state['theme.mode'])
  const emit = useSignal()

  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        emit('capture.open')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [emit])

  return (
    <AppView 
      theme={theme}
      onNew="capture.open"
      onToggleTheme="theme.toggle"
    />
  )
}

export default App 