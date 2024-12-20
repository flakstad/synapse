export type SignalPayload = any
// Tuple format for concise signal creation: 'signalName' or ['signalName', payload?]
export type SignalTuple<T extends string> = [T, SignalPayload?]
export type SignalItem<T extends string> = T | SignalTuple<T>

// Normalized signal format used internally
export type DataSignal<T extends string> = {
  type: T
  payload?: SignalPayload
}

export type SignalData<T extends string> = {
  signals: SignalItem<T>[]
  event?: Event
}

export type SignalProcessor<T extends string, S> = (
  state: S,
  signal: DataSignal<T>,
  event?: Event,
) => void

export type SignalHandlers<T extends string, S> = {
  [K in T]: SignalProcessor<T, S>
}

type RouteSignalConfig<E extends string> = {
  enter?: SignalItem<E>[]
  leave?: SignalItem<E>[]
}

export type RouteSignals<E extends string> = {
  [path: string]: RouteSignalConfig<E>
}
