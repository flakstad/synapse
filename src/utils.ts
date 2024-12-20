import { DataSignal, SignalItem } from "./types"

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj)
}

export function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.')
  const last = parts.pop()
  const parent = parts.reduce((acc, part) => (acc[part] = acc[part] || {}), obj)
  if (last) {
    parent[last] = value
  }
}

export function unpackEvent<E extends string>(event: SignalItem<E>): DataSignal<E> {
  if (Array.isArray(event)) {
    const [type, payload] = event
    return { type, payload }
  } else {
    return { type: event }
  }
}
