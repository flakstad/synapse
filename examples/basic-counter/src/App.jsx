import { useStore, dispatch } from './store'

export default function App() {
  const state = useStore()
  
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
          onClick={() => dispatch('INCREMENT')}
        >
          Increment
        </button>
        <button 
          style={styles.button}
          onClick={() => dispatch('DECREMENT')}
        >
          Decrement
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          style={styles.button}
          onClick={() => dispatch('TOGGLE_THEME')}
        >
          Toggle Theme ({state.theme})
        </button>
      </div>
    </div>
  )
}