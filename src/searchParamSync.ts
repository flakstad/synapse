// searchParamSync.ts
import { AppState } from './usage'
import { getNestedValue, setNestedValue } from './utils'

// Fields from data store to be synced with searchParams
export const syncedFields = [
  'search.q',
  'fileId',
  'fileModalOpen',
  'evidenceModalOpen',
  'autoPlay',
  'timestampSeconds',
  'selectedTab',
  'insightId',
  'selectedQuoteIdx',
  'selectedDocumentId',
]

export type SearchParamSync = {
  [K in (typeof syncedFields)[number]]: any
}

export function load(): Partial<AppState> {
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

export function update(state: AppState) {
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
