import dispatch from "dispatch";

export function dispatcherWithBackend(backend) {
    return dispatch({
        '/hey': {
            GET: (req, res) => res.json(backend.ho())
        },
        '/publish/:formPath': {
            PUT: (req, res, next, formPath) => {
                console.log('publish ', formPath, req.body);
                // gjør et eller annet lookup med jwt_tokenet.
                // lag en ny publiserings commit og push den
                // get latest publiserings repo
                // lag ny commit på toppen av dette

                // update eller create subfoler ${formPath} med fil form.json som er identisk med req.body
                backend.clonePublishingRepo();
                backend.createOrUpdateForm(formPath, req.body);
                backend.commitChange();
                backend.pushPublishingRepo();
                // overskriv form-io-utvidelser filen med full git url til ${this-git-commit}
                // publisering-test repo har en git submodule som er skjemabygging-formio.
                // set submodule i commiten til å være oss selv
                // eller ta form-io-utvidelses "staten" og kopier den inn i et directory
                // push denne
                res.send({message: 'Happy clappy', form: req.body});
            }
        }
    });
}