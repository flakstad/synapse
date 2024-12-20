import { State } from './state'

export function enableDebug<S>(dispatch: Function, store: State<S>) {
  if (typeof window !== 'undefined') {
    (window as any).Synapse = {
      dispatch,
      store,
    }
  }
}