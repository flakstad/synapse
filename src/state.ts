export class State<T> {
  private state: T
  private listeners: (() => void)[] = []

  constructor(initialState: T) {
    this.state = initialState
  }

  get(): T {
    return this.state
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

  merge(newState: Partial<T>) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  reset(newState: T) {
    this.state = newState
    this.notifyListeners()
  }

  swap<Args extends any[]>(
    fn: (currentValue: T, ...args: Args) => T,
    ...args: Args
  ) {
    this.state = fn(this.state, ...args)
    this.notifyListeners()
  }
}
