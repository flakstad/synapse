import { useSignal, withSignalHandlers } from '../synapse'

// The following simple version works if no need to pass props to the button
//export const Button = withSignalHandlers('button', useSignal())

const BaseButton = ({ children, style, onClick }) => (
  <button onClick={onClick} style={style}>
    {children}
  </button>
)

export const Button = withSignalHandlers(BaseButton, useSignal()) 