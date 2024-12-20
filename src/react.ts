/** @jsx React.createElement */
import { useEffect, useState, ComponentType, createElement } from 'react'
import type { State } from './state'
import type { SignalItem, SignalTuple } from './types'

type SignalHandler<E extends string> = E | SignalTuple<E> | Array<E | SignalTuple<E>>

type WithSignalProps<P, E extends string> = {
  [K in keyof P]: K extends `on${string}`
    ? P[K] | SignalHandler<E>
    : P[K]
}

type SignalHandlerHOC = <P extends {}, E extends string>(
  WrappedComponent: ComponentType<P> | string
) => ComponentType<WithSignalProps<P, E>>

export function createSynapseHooks<S, E extends string>(synapse: { 
  state: State<S>, 
  emit: (signals: SignalItem<E>[] | SignalItem<E>, event?: Event) => void,
  select?: (key: string) => any 
}) {
  const withSignalHandlers: SignalHandlerHOC = (WrappedComponent) => {
    return function SignalHandler(props) {
      const emit = synapse.emit
      const processedProps = Object.entries(props).reduce((acc, [key, value]) => {
        if (key.startsWith('on') && (Array.isArray(value) || typeof value === 'string')) {
          acc[key] = (event: Event) => emit(value as SignalHandler<E>, event)
        } else {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      return createElement(WrappedComponent as any, processedProps)
    }
  }

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
    },
    withSignalHandlers
  }
}
