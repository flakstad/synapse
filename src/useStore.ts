import { useState, useEffect } from 'react'
import { Store } from './store'

export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState(store.get())

  useEffect(() => {
    return store.subscribe(() => {
      setState(store.get())
    })
  }, [store])

  return state
}
