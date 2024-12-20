import { getNestedValue, setNestedValue } from './utils'

export function load<S>(syncedFields: string[]): Partial<S> {
  const searchParams = new URLSearchParams(window.location.search)
  const initialState: Partial<S> = {}

  syncedFields.forEach((field) => {
    const value = searchParams.get(field)
    if (value !== null) {
      setNestedValue(initialState, field, value)
    }
  })

  return initialState
}

export function update<S>(state: S, syncedFields: string[]) {
  const searchParams = new URLSearchParams(window.location.search)
  syncedFields.forEach((field) => {
    const value = getNestedValue(state, field)
    if (value !== undefined && value !== null) {
      searchParams.set(field, String(value))
    } else {
      searchParams.delete(field)
    }
  })

  window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
}
