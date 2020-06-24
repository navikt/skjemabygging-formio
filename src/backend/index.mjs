import dispatch from "dispatch";

export class Backend {
  ho() {
    return {message: 'ho'};
  }
}

export function dispatcherWithBackend(backend) {
  return dispatch({
    '/api': {
      '/hey': {
        GET: (req, res) => res.json(backend.ho())
      }
    }
  });
}
