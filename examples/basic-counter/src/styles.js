export const styles = {
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
  container: (theme) => ({
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: theme === 'light' ? '#ffffff' : '#333333',
    color: theme === 'light' ? '#333333' : '#ffffff',
    minHeight: '100vh',
  })
} 