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
  const countriesWithLocale = {
    en: [
      { label: "Norway", value: "NO" },
      { label: "Sweden", value: "SE" },
    ],
    nb: [
      { label: "Norge", value: "NO" },
      { label: "Sverige", value: "SE" },
    ],
  };

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
        POST: (req, res) => {
          res.json({ _id: "_translationId" });
        },
      },
      "/language/submission/:translationId": {
        PUT: (req, res) => {
          res.send(200);
        },
      },

      "/countries": (req, res) => {
        res.json(countriesWithLocale[req.params.get("lang")]);
      },

      "/mottaksadresse/submission": {
        GET: (req, res) => {
          res.json(mottaksadresser);
        },
      },
    })
  );
}
