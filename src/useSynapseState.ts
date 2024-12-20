import { useState, useEffect } from 'react'
import { State } from './state'

export function useSynapseState<T>(state: State<T>): T {
  const [internalState, setInternalState] = useState(state.get())

  useEffect(() => {
    return state.subscribe(() => {
      setInternalState(state.get())
    })
  }, [state])

  return internalState
}
