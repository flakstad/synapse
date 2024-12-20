export class Store<T> {
  private state: T
  private listeners: (() => void)[] = []

  constructor(initialState: T) {
    this.state = initialState
  }

  get(): T {
    return this.state
  }

  merge(newState: Partial<T>) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }
}
