import { useSynapseState } from '../synapse'

export function Profile({ name, lastActive }) {
  return (
    <div>
      <h2>Profile Page</h2>
      {name ? (
        <>
          <p>Name: {name}</p>
          <p>Last Active: {new Date(lastActive).toLocaleString()}</p>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  )
}

export function $Profile() {
  const name = useSynapseState(state => state['profile.name'])
  const lastActive = useSynapseState(state => state['profile.lastActive'])
  
  return <Profile name={name} lastActive={lastActive} />
} 