export function enableStoreAndEventDevTools(dispatch: any, store: any) {
  if (typeof window !== 'undefined') {
    (window as any).Synapse = {
      dispatch,
      store,
    }
  }
}