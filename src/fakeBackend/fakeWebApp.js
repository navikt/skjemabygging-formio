import dispatch from "dispatch";

export function parseQueryParams(dispatcher) {
  return (request, responseContext, next) => {
    const [, searchPart] = request.url.split('?');
    if (searchPart) {
      const search = `?${searchPart}`;
      const params = new URLSearchParams(search);
      request = {...request, params, search}
    }
    dispatcher(request, responseContext, next);
  }
}

export function dispatcherWithBackend(backend) {
  return parseQueryParams(dispatch({
    '/testForm': (req, res) => {
      res.json(backend.form());
    },
    '/form': (req, res) => {
      res.json(backend.forms({type: req.params.get('type'), tags: req.params.get('tags')}));
    }
  }));
}
