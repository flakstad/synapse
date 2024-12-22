import { useSignal, withSignalHandlers } from '../synapse'

export function ButtonInner({ onClick, style, children }) {
  return (
    <button 
      onClick={onClick} 
      style={style}
    >
      {children}
    </button>
  )
}

// Create the connected version using the current synapse instance
export function createButton(emit) {
  return withSignalHandlers(ButtonInner, emit)
}

// Hook version that gets the emitter automatically
export function Button(props) {
  const emit = useSignal()
  const ConnectedButton = withSignalHandlers(ButtonInner, emit)
  return <ConnectedButton {...props} />
} 