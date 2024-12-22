/** @jsx React.createElement */
import { useEffect, useState, ComponentType, createElement, useRef, forwardRef, ForwardRefExoticComponent, RefAttributes } from 'react'
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
) => ForwardRefExoticComponent<WithSignalProps<P, E>>

export function createSynapseHooks<S, E extends string>(synapse: { 
  state: State<S>, 
  emit: (signals: SignalItem<E>[] | SignalItem<E>, event?: Event) => void,
  select?: (key: string) => any 
}) {
  const withSignalHandlers: SignalHandlerHOC = (WrappedComponent) => {
    return forwardRef<any, WithSignalProps<any, E>>(function SignalHandler(props, ref) {
      const emit = synapse.emit
      const processedProps = Object.entries(props).reduce((acc, [key, value]) => {
        if (key.startsWith('on') && (Array.isArray(value) || typeof value === 'string')) {
          acc[key] = (event: Event) => emit(value as SignalHandler<E>, event)
        } else {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, any>)

      return createElement(WrappedComponent as any, { ...processedProps, ref })
    })
  }

  const isEqual = (a: any, b: any): boolean => {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object') return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every(key => isEqual(a[key], b[key]));
  }

  return {
    useSignal: () => synapse.emit,
    useSynapseState: <T>(selector?: (state: S) => T) => {
      const [value, setValue] = useState(() => 
        selector ? selector(synapse.state.get()) : synapse.state.get()
      )
      
      const previousValueRef = useRef(value);
      const memoizedSelector = useRef(selector);
      
      const selectorPath = useRef<string | null>(null);
      
      useEffect(() => {
        if (memoizedSelector.current) {
          const selectorStr = memoizedSelector.current.toString();
          const match = selectorStr.match(/state\[['"]([^'"]+)['"]\]/);
          if (match) {
            selectorPath.current = match[1];
          }
        }
      }, []);

      useEffect(() => {
        return synapse.state.subscribe((changedPaths = []) => {
          if (selectorPath.current && changedPaths.length > 0 && 
              !changedPaths.includes(selectorPath.current)) {
            return;
          }

          const nextState = synapse.state.get();
          const nextValue = memoizedSelector.current 
            ? memoizedSelector.current(nextState) 
            : nextState;
          
          const hasChanged = typeof nextValue === 'object' && nextValue !== null
            ? !isEqual(previousValueRef.current, nextValue)
            : previousValueRef.current !== nextValue;

          if (hasChanged) {
            previousValueRef.current = nextValue;
            setValue(nextValue);
          }
        })
      }, [])

      return value
    },
    withSignalHandlers
  }
}
