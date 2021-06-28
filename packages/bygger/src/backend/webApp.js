import dispatch from "dispatch";
import { HttpError } from "./fetchUtils.js";

export function dispatcherWithBackend(backend) {
  return dispatch({
    "/hey": {
      GET: (req, res) => res.json(backend.ho()),
    },
    "/publish/:formPath": {
      PUT: (req, res) => res.status(503).send("Publisering er for øyeblikket under ombygging"),
      /*PUT: async (req, res, next, formPath) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
        }
        try {
          await backend.publishForm(req.body.token, req.body.form, req.body.translations, formPath);
          res.send("Publisering vellykket!");
        } catch (error) {
          if (error instanceof HttpError && error.response.status === 401) {
            console.log("Unauthorized", error.message);
            res.status(401).send("Unauthorized");
          } else {
            console.error("Internal server error", error.message);
            res.status(500).send("Noe galt skjedde");
          }
        }
      },*/
    },
  });
}
