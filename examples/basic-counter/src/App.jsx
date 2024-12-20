import { useSynapse, emit } from './my_synapse'

export default function App() {
  const state = useSynapse()
  
  const styles = {
    container: {
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: state.theme === 'light' ? '#ffffff' : '#333333',
      color: state.theme === 'light' ? '#333333' : '#ffffff',
      minHeight: '100vh',
    },
    button: {
      margin: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      cursor: 'pointer'
    }
  }

  return (
    <div style={styles.container}>
      <h1>Synapse Counter Example</h1>
      
      <div>
        <h2>Count: {state.count}</h2>
        <button 
          style={styles.button}
          onClick={() => emit('INCREMENT')}
        >
          Increment
        </button>
        <button 
          style={styles.button}
          onClick={() => emit('DECREMENT')}
        >
          Decrement
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          style={styles.button}
          onClick={() => emit('TOGGLE_THEME')}
        >
          Toggle Theme ({state.theme})
        </button>
      </div>
    </div>
  )
}