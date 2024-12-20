import { Store } from './store'
import { DataEvent } from './types'

export type EventHandler<S, T extends string> = (
  store: Store<S>,
  dataEvent: DataEvent<T>,
  originalEvent?: Event | React.SyntheticEvent,
) => void

export type EventHandlers<S, T extends string> = {
  [K in T]: EventHandler<S, K>
}

export function createEventHandler<S, T extends string>(
  handlers: EventHandlers<S, T>,
): (
  store: Store<S>,
  event: DataEvent<T>,
  originalEvent?: Event | React.SyntheticEvent,
) => void {
  return (store, event, originalEvent) => {
    const handler = handlers[event.type] as EventHandler<S, T>
    handler(store, event, originalEvent)
  }
} 