// localStorageSync.ts
import { AppState } from '../examples/usage'
import { getNestedValue, setNestedValue } from './utils'

// Fields from data store to be synced with localStorage
export const syncedFields = ['assets']

export type LocalStorageSyncedState = {
  [K in (typeof syncedFields)[number]]: any
}

export function load(): Partial<AppState> {
  const initialState: Partial<AppState> = {}

  syncedFields.forEach((field) => {
    const value = localStorage.getItem(field)
    if (value !== null) {
      try {
        const parsedValue = JSON.parse(value)
        setNestedValue(initialState, field, parsedValue)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`Error parsing localStorage value for ${field}:`, e)
      }
    }
  })

  return initialState
}

export function update(state: AppState) {
  syncedFields.forEach((field) => {
    const value = getNestedValue(state, field)
    if (value !== undefined && value !== null) {
      localStorage.setItem(field, JSON.stringify(value))
    } else {
      localStorage.removeItem(field)
    }
  })
}
