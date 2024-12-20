export function enableSynapseDevTools(dispatch: any, state: any) {
  if (typeof window !== 'undefined') {
    (window as any).Synapse = {
      dispatch,
      state,
    }
  }
}