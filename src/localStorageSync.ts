import { AppState } from '../examples/usage'
import { getNestedValue, setNestedValue } from './utils'

export type LocalStorageSyncedState = {
  [K in string]: any
}

export function load(syncedFields: string[]): Partial<AppState> {
  const initialState: Partial<AppState> = {}

  syncedFields.forEach((field) => {
    const value = localStorage.getItem(field)
    if (value !== null) {
      try {
        const parsedValue = JSON.parse(value)
        setNestedValue(initialState, field, parsedValue)
      } catch (e) {
        console.error(`Error parsing localStorage value for ${field}:`, e)
      }
    }
  })

  return initialState
}

export function update(state: AppState, syncedFields: string[]) {
  syncedFields.forEach((field) => {
    const value = getNestedValue(state, field)
    if (value !== undefined && value !== null) {
      localStorage.setItem(field, JSON.stringify(value))
    } else {
      localStorage.removeItem(field)
    }
  })
}
