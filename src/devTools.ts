export function enableSynapseDevTools(emit: any, state: any) {
  if (typeof window !== 'undefined') {
    (window as any).Synapse = {
      emit,
      state,
    }
  }
}