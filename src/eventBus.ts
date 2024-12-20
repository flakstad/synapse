import { SignalItem, SignalData } from './types'

export class EventBus<E extends string> {
  private handler:
    | ((signal: SignalItem<E>, event?: Event | React.SyntheticEvent) => void)
    | null = null

  setHandler(handler: (signal: SignalItem<E>, event?: Event | React.SyntheticEvent) => void) {
    this.handler = handler
  }

  dispatch(data: SignalData<E>) {
    if (this.handler) {
      data.signals.forEach((signal) => {
        if (this.handler) {
          //console.log('Dispatching signal', signal, data.event)
          this.handler(signal, data.event)
        }
      })
    } else {
      console.warn('No handler set for EventBus')
    }
  }
}
