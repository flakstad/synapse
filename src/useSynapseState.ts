import { useState, useEffect } from 'react'
import { State } from './state'

export function useSynapseState<T>(store: State<T>): T {
  const [state, setState] = useState(store.get())

  useEffect(() => {
    return store.subscribe(() => {
      setState(store.get())
    })
  }, [store])

  return state
}
