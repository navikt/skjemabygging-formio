import dispatch from "dispatch";
import { HttpError } from "./fetchUtils.js";
import { getMigratedForm, migrateForms } from "./migrationScripts.js";

const ALLOWED_RESOURCES = [/^mottaksadresser$/, /^global-translations-([a-z]{2}(-NO)?)$/];
export const isValidResource = (resourceName) => {
  return ALLOWED_RESOURCES.some((regex) => regex.test(resourceName));
};

export function dispatcherWithBackend(backend) {
  function handleError(error, res) {
    if (error instanceof HttpError && error.response.status === 401) {
      console.log("Unauthorized", error.message);
      res.status(401).send("Unauthorized");
    } else {
      console.error("Internal server error", error.message);
      res.status(500).send(`Noe galt skjedde: ${error.message}`);
    }
  }

  return dispatch({
    "/hey": {
      GET: (req, res) => res.json(backend.ho()),
    },
    "/publish/:formPath": {
      PUT: async (req, res, next, formPath) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
        }
        try {
          await backend.publishForm(req.body.token, req.body.form, req.body.translations, formPath);
          res.send(`Publisering av skjema ${formPath} ok!`);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/published-resource/:resourceName": {
      PUT: async (req, res, next, resourceName) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
          return;
        }
        if (!isValidResource(resourceName)) {
          res.status(400).send(`Illegal resourceName: ${resourceName}`);
          return;
        }
        try {
          await backend.publishResource(req.body.token, resourceName, req.body.resource);
          res.send(`Publisering av ressurs ${resourceName} ok!`);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/enhetsliste": {
      GET: async (req, res) => {
        try {
          const enhetsListe = await backend.fetchEnhetsliste();
          res.send(enhetsListe);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/migrate": {
      GET: async (req, res) => {
        const searchFilters = JSON.parse(req.query["searchFilters"] || "{}");
        const editOptions = JSON.parse(req.query["editOptions"] || "{}");
        try {
          migrateForms(searchFilters, editOptions).then((migratedForms) => res.send(migratedForms));
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/migrate/preview/:formPath": {
      GET: async (req, res, next, formPath) => {
        const form = getMigratedForm(formPath);
        if (form) {
          res.send(form);
        } else {
          handleError({ message: "Skjemaet finnes ikke blant berørte skjemaer" }, res);
        }
      },
    },
  });
}
