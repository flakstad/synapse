import { useEffect, useCallback } from 'react'
import { useSynapseState, useSignal, withSignalHandlers } from './synapse'

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

// Create signal-aware versions of common elements
const Button = withSignalHandlers('button')

// Split the container into its own component
const Container = ({ children }) => {
  const theme = useSynapseState(state => state['theme.mode'])
  console.log('Container rendered')
  return (
    <div style={getContainerStyles(theme)}>
      {children}
    </div>
  )
}

export default function App() {
  const currentPath = useSynapseState(state => state['nav.path'])
  const count = useSynapseState(state => state['counter.value'])
  const profileName = useSynapseState(state => state['profile.name'])
  const profileLastActive = useSynapseState(state => state['profile.lastActive'])

  useEffect(() => {
    const handlePopState = () => {
      useSignal()(['nav.to', { path: window.location.pathname }])
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [useSignal])

  console.log('App rendered')
  return (
    <Container>
      <h1>Synapse Counter Example</h1>
      
      <Navigation currentPath={currentPath} />

      {currentPath === '/counter' ? (        
        <Counter count={count} />
      ) : currentPath === '/profile' ? (
        <Profile name={profileName} lastActive={profileLastActive} />
      ) : (
        <Home />
      )}
    </Container>
  )
}

const Counter = ({ count }) => {
  console.log('Counter rendered');
  return (
    <div>
      <h2>Count: {count}</h2>
      <Button onClick="counter.increment" onMouseOver={['sys.log', { message: 'Increment button hovered' }]} style={styles.button}>
        Increment
      </Button>
      <Button onClick="counter.decrement" style={styles.button}>
        Decrement
      </Button>
      <Button onClick={() => console.log('Test')} style={styles.button}>
        Test
      </Button>
    </div>
  )
}

const Navigation = ({ currentPath }) => (
  <div style={styles.tabs}>
    <Button
      onClick={['nav.to', { path: '/' }]}
      style={{
        ...styles.tab,
        ...(currentPath === '/' ? styles.activeTab : {}),
      }}
    >
      Home
    </Button>
    <Button
      onClick={['nav.to', { path: '/counter' }]}
      style={{
        ...styles.tab,
        ...(currentPath === '/counter' ? styles.activeTab : {}),
      }}
    >
      Counter
    </Button>
    <Button
      onClick={['nav.to', { path: '/profile' }]}
      style={{
        ...styles.tab,
        ...(currentPath === '/profile' ? styles.activeTab : {}),
      }}
    >
      Profile
    </Button>
  </div>
)

// Separate the theme-dependent part of Home into its own component
const ThemeToggle = () => {
  const theme = useSynapseState(state => state['theme.mode'])
  console.log('ThemeToggle rendered')
  return (
    <div style={{ marginTop: '2rem' }}>
      <Button onClick="theme.toggle" style={styles.button}>
        Toggle Theme ({theme})
      </Button>
    </div>
  )
}

const Home = () => {
  console.log('Home rendered')
  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      <p>Navigate to the Counter page to see the counter in action!</p>
      <ThemeToggle />
      <div style={{ marginTop: '2rem' }}>
        <Button onClick="state.reset" style={styles.button}>
          Reset
        </Button>
      </div> 
    </div>
  )
}

const Profile = ({ name, lastActive }) => {
  console.log('Profile rendered');
  return (
    <div>
      <h2>Profile Page</h2>
      {name ? (
        <div>
          <p>Name: {name}</p>
          <p>Last Active: {new Date(lastActive).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  )
}
