import { useEffect } from 'react'
import { useSynapseState, useSignal } from './synapse'
import { Button } from './components/Button'
import { $Counter } from './components/Counter'
import { $Profile } from './components/Profile'
import { styles } from './styles'

const Container = ({ children }) => {
  const theme = useSynapseState(state => state['theme.mode'])
  console.log('Container rendered')
  return (
    <div style={styles.container(theme)}>
      {children}
    </div>
  )
}

export default function $App() {
  const currentPath = useSynapseState(state => state['nav.path'])

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
        <$Counter />
      ) : currentPath === '/profile' ? (
        <$Profile />
      ) : (
        <Home />
      )}
    </Container>
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
