import fetch from "node-fetch";

export class Backend {
  constructor(projectURL, gitUrl, user, pass) {
    this.projectURL = projectURL;
    this.gitUrl = gitUrl;
    this.user = user;
    this.pass = pass;
  }

  createOrUpdateFormInGH(formurl, body) {
    fetch(formurl, {
      method: "put",
      body: body,
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.user}:${this.pass}`).toString("base64"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  }

  publishUpdateToForm(formname, formcontent, sha) {
    const updateFileContent = {
      message: `Oppdatert versjon av ${formname}.json`,
      content: Buffer.from(JSON.stringify(formcontent)).toString("base64"),
      sha: sha,
    };

    this.createOrUpdateFormInGH(`${this.gitUrl}/${formname}.json`, JSON.stringify(updateFileContent));
  }

  publishNewForm(formname, formcontent) {
    const newFileContent = {
      message: `Nytt skjema ${formname}.json`,
      content: Buffer.from(JSON.stringify(formcontent)).toString("base64"),
    };

    this.createOrUpdateFormInGH(`${this.gitUrl}/${formname}.json`, JSON.stringify(newFileContent));
  }

  createAndPushCommit(form, formpath, gitUrl = this.gitUrl) {
    fetch(gitUrl, {
      method: "get",
      headers: {
        Authorization: "Basic " + Buffer.from(`${this.user}:${this.pass}`).toString("base64"),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((listOfForms) => listOfForms.filter((content) => content.name === `${formpath}.json`))
      .then((listOfFormsMatchingFormname) =>
        listOfFormsMatchingFormname.length === 0
          ? this.publishNewForm(formpath, form)
          : this.publishUpdateToForm(formpath, form, listOfFormsMatchingFormname[0].sha)
      )
      .catch((e) => console.error("Error", e));
  }

  getProjectURL() {
    return this.projectURL;
  }
}
