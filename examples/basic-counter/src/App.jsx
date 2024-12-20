import { synapse, createSignalProcessor, searchParamSync, localStorageSync } from '../../../src/index'
import { createSynapseHooks } from '../../../src/react'
import { useEffect } from 'react'

const defaultInitialState = {
  count: 0,
  theme: 'light',
  currentPath: "/"
}

const styles = {
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

const getContainerStyles = (theme) => ({
  padding: '2rem',
  textAlign: 'center',
  backgroundColor: theme === 'light' ? '#ffffff' : '#333333',
  color: theme === 'light' ? '#333333' : '#ffffff',
  minHeight: '100vh',
})

const synapseInstance = synapse({
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

const { useSynapseState, useSignal } = createSynapseHooks(synapseInstance)

// Create a signal handler HOC
const withSignalHandlers = (WrappedComponent) => {
  return function SignalHandler(props) {
    const emit = useSignal()
    
    // Process all props that could be signals
    const processedProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (key.startsWith('on') && (Array.isArray(value) || typeof value === 'string')) {
        // Convert signal to handler function
        acc[key] = (event) => emit(value, event)
      } else {
        acc[key] = value
      }
      return acc
    }, {})

    return <WrappedComponent {...processedProps} />
  }
}

// Creating signal-aware versions of common elements..
const Button = withSignalHandlers('button')
const Link = withSignalHandlers('a')

export default function App() {
  const theme = useSynapseState(state => state.theme)
  const currentPath = useSynapseState(state => state.currentPath)
  const count = useSynapseState(state => state.count)

  useEffect(() => {
    const handlePopState = () => {
      useSignal()(['NAVIGATE', { path: window.location.pathname }])
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [useSignal])

  return (
    <div style={getContainerStyles(theme)}>
      <h1>Synapse Counter Example</h1>
      
      <Navigation currentPath={currentPath} />

      {currentPath === '/counter' ? (
        <Counter count={count} />
      ) : (
        <Home theme={theme} />
      )}
    </div>
  )
}

const Counter = ({ count }) => (
  <div>
    <h2>Count: {count}</h2>
    <Button onClick="INCREMENT" style={styles.button}>
      Increment
    </Button>
    <Button onClick="DECREMENT" style={styles.button}>
      Decrement
    </Button>
  </div>
)

const Navigation = ({ currentPath }) => (
  <div style={styles.tabs}>
    <Button
      onClick={['NAVIGATE', { path: '/' }]}
      style={{
        ...styles.tab,
        ...(currentPath === '/' ? styles.activeTab : {}),
      }}
    >
      Home
    </Button>
    <Button
      onClick={['NAVIGATE', { path: '/counter' }]}
      style={{
        ...styles.tab,
        ...(currentPath === '/counter' ? styles.activeTab : {}),
      }}
    >
      Counter
    </Button>
  </div>
)

const Home = ({ theme }) => (
  <div>
    <h2>Welcome to the Home Page</h2>
    <p>Navigate to the Counter page to see the counter in action!</p>
    <div style={{ marginTop: '2rem' }}>
      <Button onClick="TOGGLE_THEME" style={styles.button}>
        Toggle Theme ({theme})
      </Button>
    </div> 
    <div style={{ marginTop: '2rem' }}>
      <Button onClick="CLEAR" style={styles.button}>
        Reset
      </Button>
    </div> 
  </div>
)
