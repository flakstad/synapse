import { useEffect, useState } from 'react'
import type { State } from './state'
import type { SignalItem } from './types'

export function createSynapseHooks<S, E extends string>(synapse: { 
  state: State<S>, 
  emit: (signals: SignalItem<E>[] | SignalItem<E>, event?: Event) => void,
  select?: (key: string) => any 
}) {
  return {
    useSignal: () => synapse.emit,
    
    useSynapseState: <T>(selector?: (state: S) => T) => {
      const [value, setValue] = useState(() => 
        selector ? selector(synapse.state.get()) : synapse.state.get()
      )

      useEffect(() => {
        return synapse.state.subscribe(() => {
          setValue(selector ? selector(synapse.state.get()) : synapse.state.get())
        })
      }, [selector])

      return value
    }
  }
}
