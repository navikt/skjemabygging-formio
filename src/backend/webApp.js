import dispatch from "dispatch";

export function dispatcherWithBackend(backend) {
  return dispatch({
    "/hey": {
      GET: (req, res) => res.json(backend.ho()),
    },
    "/publish/:formPath": {
      PUT: async (req, res, next, formPath) => {
        if (!req.body.token) {
          res.status(401).send("Unauthorized");
        }

        const result = await backend.publishForm(req.body.token, req.body.form, formPath);

        if (result.status === "OK") {
          res.send("Publisering vellykket!");
        } else if (result.status === "UNAUTHORIZED") {
          console.log("Unauthorized");
          res.status(401).send("Unauthorized");
        } else {
          console.error("Internal server error");
          res.status(500).send("Noe galt skjedde");
        }
      },
    },
  });
}
