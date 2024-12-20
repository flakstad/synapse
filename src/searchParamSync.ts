import { AppState } from '../examples/usage'
import { getNestedValue, setNestedValue } from './utils'

export type SearchParamSync = {
  [K in string]: any
}

export function load(syncedFields: string[]): Partial<AppState> {
  const searchParams = new URLSearchParams(window.location.search)
  const initialState: Partial<AppState> = {}

  syncedFields.forEach((field) => {
    const value = searchParams.get(field)
    if (value !== null) {
      setNestedValue(initialState, field, value)
    }
  })

  return initialState
}

export function update(state: AppState, syncedFields: string[]) {
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
