import dispatch from "dispatch";
import { HttpError } from "./fetchUtils.js";
import { migrateForms, previewForm } from "./migration/migrationScripts.js";

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
          const result = await backend.publishForm(req.body.token, req.body.form, req.body.translations, formPath);
          res.json({ changed: !!result, result });
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/publish-bulk": {
      PUT: async (req, res) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
          return;
        }
        if (!Array.isArray(req.body.payload.formPaths) || req.body.payload.formPaths.length === 0) {
          res.status(400).send("Request is missing formPaths");
        }
        try {
          const result = await backend.bulkPublishForms(req.body.token, req.body.payload.formPaths);
          res.json({ changed: !!result, result });
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
          const result = await backend.publishResource(req.body.token, resourceName, req.body.resource);
          res.json({ changed: !!result, result });
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
          const allForms = await backend.getAllForms();
          const { log } = await migrateForms(searchFilters, editOptions, allForms);
          res.send(log);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/migrate/preview/:formPath": {
      GET: async (req, res, next, formPath) => {
        const searchFilters = JSON.parse(req.query["searchFilters"] || "{}");
        const editOptions = JSON.parse(req.query["editOptions"] || "{}");
        try {
          const form = await backend.getForm(formPath);
          const formForPreview = await previewForm(searchFilters, editOptions, form);
          res.json(formForPreview);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
    "/migrate/update": {
      POST: async (req, res) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
          return;
        }
        const { searchFilters, editOptions, include } = req.body.payload;
        try {
          const allForms = await backend.getAllForms();
          const { migratedForms } = await migrateForms(searchFilters, editOptions, allForms, include);
          const migratedFormsData = await backend.updateForms(req.body.token, migratedForms);
          res.send(migratedFormsData);
        } catch (error) {
          handleError(error, res);
        }
      },
    },
  });
}
