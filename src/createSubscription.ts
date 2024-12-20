// createSubscription.ts
import { Query, onSnapshot } from 'firebase/firestore'
import { unconventionalErrorModal } from '../../utils/unconventionalErrorModal'

export type SubscriptionStatus = 'init' | 'loading' | 'loaded' | 'error'

export type Subscription<T> = {
  status: SubscriptionStatus
  payload?: T[]
  error?: string
  unsubscribe: () => void
}

export function createSubscription<T>(
  query: Query<T>,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void,
): Subscription<T> {
  let status: SubscriptionStatus = 'init'
  let payload: T[] | undefined
  let error: string | undefined

  const unsubscribe = onSnapshot(
    query,
    (snapshot) => {
      status = 'loaded'
      payload = snapshot.docs.map((doc) => doc.data())
      onData(payload)
    },
    (err) => {
      status = 'error'
      error = err.message ?? JSON.stringify(err)
      if (onError) {
        onError(err)
      } else {
        unconventionalErrorModal(undefined, null, err)
      }
    },
  )

  return {
    get status() {
      return status
    },
    get payload() {
      return payload
    },
    get error() {
      return error
    },
    unsubscribe,
  }
}
