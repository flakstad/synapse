import { useEffect } from 'react'
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

export default function App() {
  const theme = useSynapseState(state => state['theme.mode'])
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

  return (
    <div style={getContainerStyles(theme)}>
      <h1>Synapse Counter Example</h1>
      
      <Navigation currentPath={currentPath} />

      {currentPath === '/counter' ? (
        <Counter count={count} />
      ) : currentPath === '/profile' ? (
        <Profile name={profileName} lastActive={profileLastActive} />
      ) : (
        <Home theme={theme} />
      )}
    </div>
  )
}

const Counter = ({ count }) => (
  <div>
    <h2>Count: {count}</h2>
    <Button onClick="counter.increment" style={styles.button}>
      Increment
    </Button>
    <Button onClick="counter.decrement" style={styles.button}>
      Decrement
    </Button>
  </div>
)

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

const Home = ({ theme }) => (
  <div>
    <h2>Welcome to the Home Page</h2>
    <p>Navigate to the Counter page to see the counter in action!</p>
    <div style={{ marginTop: '2rem' }}>
      <Button onClick="theme.toggle" style={styles.button}>
        Toggle Theme ({theme})
      </Button>
    </div> 
    <div style={{ marginTop: '2rem' }}>
      <Button onClick="state.reset" style={styles.button}>
        Reset
      </Button>
    </div> 
  </div>
)

const Profile = ({ name, lastActive }) => (
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
