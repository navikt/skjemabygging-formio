import dispatch from "dispatch";
import mottaksadresser from "./mock-mottaksadresser";

export function parseQueryParams(dispatcher) {
  return (request, responseContext, next) => {
    const [, searchPart] = request.url.split("?");
    if (searchPart) {
      const search = `?${searchPart}`;
      const params = new URLSearchParams(search);
      request = { ...request, params, search };
    }
    dispatcher(request, responseContext, next);
  };
}

export function dispatcherWithBackend(backend) {
  const translations = [{ data: { i18n: { ja: "yes" }, language: "en", scope: "global" } }];
  const countries = [
    { label: "Norway", value: "NO" },
    { label: "Austria", value: "AT" },
  ];

  return parseQueryParams(
    dispatch({
      "/": (req, res) => {
        res.json(backend.project());
      },
      "/testForm": (req, res) => {
        res.json(backend.form());
      },
      "/form": {
        GET: (req, res) => {
          res.json(backend.forms({ type: req.params.get("type"), tags: req.params.get("tags") }));
        },
        POST: (req, res) => {
          const newForm = backend.addForm(JSON.parse(req.body));
          res.json(newForm);
        },
      },
      "/user/login": (req, res) => {
        res.json(backend.adminLoginForm());
      },

      "/language/submission": {
        GET: (req, res) => {
          res.json(translations);
        },
      },

      "/countries": (req, res) => {
        res.json(countries);
      },

      "/mottaksadresse/submission": {
        GET: (req, res) => {
          res.json(mottaksadresser);
        },
      },
    })
  );
}
