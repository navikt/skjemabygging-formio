import dispatch from "dispatch";
import fetch from "node-fetch";

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export function dispatcherWithBackend(backend) {
  return dispatch({
    "/hey": {
      GET: (req, res) => res.json(backend.ho()),
    },
    "/publish/:formPath": {
      PUT: (req, res, next, formPath) => {
        // Check that token is valid first
        fetch(`${backend.getProjectURL()}/current`, {
          headers: {
            "Content-Type": "application/json",
            "x-jwt-token": req.body.token,
          },
        })
          .then(handleErrors)
          .then(() => {
            // backend.createAndPushCommit(req.body);
            res.send("Authorized!");
          })
          .catch((err) => {
            console.error("Error ", err);
            res.send("Unauthorized!");
          })
        // gjør et eller annet lookup med jwt_tokenet.
        // lag en ny publiserings commit og push den
        // get latest publiserings repo
        // lag ny commit på toppen av dette

        // update eller create subfoler ${formPath} med fil form.json som er identisk med req.body
        // backend.clonePublishingRepo();
        // backend.createOrUpdateForm(formPath, req.body);
        // backend.commitChange();
        // backend.pushPublishingRepo();
        // overskriv form-io-utvidelser filen med full git url til ${this-git-commit}
        // publisering-test repo har en git submodule som er skjemabygging-formio.
        // set submodule i commiten til å være oss selv
        // eller ta form-io-utvidelses "staten" og kopier den inn i et directory
        // push denne
        //res.send({ message: "Happy clappy", form: req.body });
      },
    },
  });
}
