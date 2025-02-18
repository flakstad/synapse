import { useSynapseState } from '../synapse'
import { Button } from './Button'
import { styles } from '../styles'

export const counterSignals = {
  'counter.increment': (state) => {
    state.merge({ 'counter.value': Number(state.get()['counter.value']) + 1 })
  },
  'counter.decrement': (state) => {
    state.merge({ 'counter.value': Number(state.get()['counter.value']) - 1 })
  }
}

export function Counter({ count, onIncrement, onDecrement }) {
  return (
    <div>
      <h2>Count: {count}</h2>
      <Button onClick={onIncrement} style={styles.button}>
        Increment
      </Button>
      <Button onClick={onDecrement} style={styles.button}>
        Decrement
      </Button>
    </div>
  )
}

export function $Counter() {
  const count = useSynapseState(state => state['counter.value'])
  console.log('Counter rendered')
  return (
    <Counter 
      count={count}
      onIncrement="counter.increment"
      onDecrement="counter.decrement"
    />
  )
}