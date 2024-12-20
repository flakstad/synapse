import { EventItem, EventData } from './types'

export class EventBus<E extends string> {
  private handler:
    | ((event: EventItem<E>, originalEvent?: Event | React.SyntheticEvent) => void)
    | null = null

  setHandler(handler: (event: EventItem<E>, originalEvent?: Event | React.SyntheticEvent) => void) {
    this.handler = handler
  }

  dispatch(data: EventData<E>) {
    if (this.handler) {
      data.events.forEach((event) => {
        if (this.handler) {
          console.log('Dispatching event', event, data.originalEvent)
          this.handler(event, data.originalEvent)
        }
      })
    } else {
      console.warn('No handler set for EventBus')
    }
  }
}
