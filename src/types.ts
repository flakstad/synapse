// types.ts
export type EventPayload = any
export type EventTuple<T extends string> = [T, EventPayload?]
export type EventItem<T extends string> = T | EventTuple<T>

export type DataEvent<T extends string> = {
  type: T
  payload?: EventPayload
}

export type EventData<T extends string> = {
  events: EventItem<T>[]
  originalEvent?: Event | React.SyntheticEvent
}

export type EventItemHandler<T extends string, S> = (
  store: S,
  event: DataEvent<T>,
  originalEvent?: Event | React.SyntheticEvent,
) => void

export type EventHandler<T extends string> = (data: EventData<T>) => void
