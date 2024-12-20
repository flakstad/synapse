import { synapse, createSignalProcessor, searchParamSync, localStorageSync } from '../../../src/index'
import { useEffect, useState } from 'react'

const defaultInitialState = {
  count: 0,
  theme: 'light',
  currentPath: "/"
}

const { emit, state: synapseState } = synapse({
  stateInitializers: [
    () => (defaultInitialState),
    () => localStorageSync.load(['count', 'theme']),
    () => searchParamSync.load(['count', 'theme', 'currentPath']),      
  ],
  stateListeners: [
    (state) => console.log('State updated:', state),
    (state) => searchParamSync.update(state, ['count', 'theme', 'currentPath']),
    (state) => localStorageSync.update(state, ['count', 'theme']),       
  ],
  signalProcessor: createSignalProcessor({
    INCREMENT: (state) => {
      state.merge({ count: Number(state.get().count) + 1 })
    },
    DECREMENT: (state) => {
      state.swap(val => ({ ...val, count: Number(val.count) - 1 }))
    },
    TOGGLE_THEME: (state) => {
      const currentTheme = state.get().theme
      state.merge({ theme: currentTheme === 'light' ? 'dark' : 'light' })        
    },
    NAVIGATE: (state, { payload}) => {
      const path = payload?.path || '/'
      window.history.pushState(null, '', path)
      state.merge({ currentPath: path })
    },
    CONSOLE_LOG: (state, { payload }, event) => {
      console.log(payload, event)
    },
    CLEAR: (state) => {
      state.reset(defaultInitialState)
    },
  }),  
  enableDevTools: true,
  routeSignals: {
    '/': {
      enter: [['CONSOLE_LOG', { message: 'Entered home page' }]],
      leave: [['CONSOLE_LOG', { message: 'Left home page' }]]
    },
    '/counter': {
      enter: [['CONSOLE_LOG', { message: 'Entered counter page' }]],
      leave: [['CONSOLE_LOG', { message: 'Left counter page' }]]
    }
  },
  pathSelector: (state) => state.currentPath
})

export default function App() {
  const [state, setState] = useState(synapseState.get())

  useEffect(() => {
    const handlePopState = () => {
      emit(['NAVIGATE', { path: window.location.pathname }])
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const unsubscribe = synapseState.subscribe(() => {
      setState(synapseState.get())
    })    
    return unsubscribe
  }, [])

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
    },
    input: {
      margin: '1rem',
      padding: '0.5rem',
      fontSize: '1rem'
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    tab: {
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      color: 'inherit',
    },
    activeTab: {
      borderBottom: '2px solid currentColor',
    },
  }

  const renderContent = () => {
    switch (state.currentPath) {
      case '/counter':
        return (
          <div>
            <h2>Count: {state.count}</h2>
            <button style={styles.button} onClick={() => emit('INCREMENT')}>
              Increment
            </button>
            <button style={styles.button} onClick={() => emit('DECREMENT')}>
              Decrement
            </button>
          </div>
        )
      default:
        return (
          <div>
            <h2>Welcome to the Home Page</h2>
            <p>Navigate to the Counter page to see the counter in action!</p>
            <div style={{ marginTop: '2rem' }}>
              <button style={styles.button} onClick={() => emit('TOGGLE_THEME')}>
                Toggle Theme ({state.theme})
              </button>
            </div> 
            <div style={{ marginTop: '2rem' }}>
              <button style={styles.button} onClick={() => emit('CLEAR')}>
                Reset
              </button>
            </div> 
          </div>
        )
    }
  }

  return (
    <div style={styles.container}>
      <h1>Synapse Counter Example</h1>
      
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(state.currentPath === '/' ? styles.activeTab : {}),
          }}
          onClick={() => emit(['NAVIGATE', { path: '/' }])}
        >
          Home
        </button>
        <button
          style={{
            ...styles.tab,
            ...(state.currentPath === '/counter' ? styles.activeTab : {}),
          }}
          onClick={() => emit(['NAVIGATE', { path: '/counter' }])}
        >
          Counter
        </button>
      </div>

      {renderContent()}
           
    </div>
  )
}