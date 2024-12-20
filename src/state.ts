export class State<T> {
  private state: T
  private listeners: ((changedPaths?: string[]) => void)[] = []

  constructor(initialState: T) {
    this.state = initialState
  }

  get(): T {
    return this.state
  }  

  subscribe(listener: (changedPaths?: string[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(changedPaths?: string[]) {
    this.listeners.forEach((listener) => listener(changedPaths))
  }

  merge(newState: Partial<T>) {
    this.state = { ...this.state, ...newState }
    const changedPaths = Object.keys(newState)
    this.notifyListeners(changedPaths)
  }

  reset(newState: T) {
    this.state = newState
    this.notifyListeners()
  }
}
