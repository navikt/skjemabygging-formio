import { guid } from "nav-frontend-js-utils";
import qs from "qs";
import { fetchWithErrorHandling, stringTobase64 } from "./fetchUtils.js";
import { GitHubRepo } from "./GitHubRepo.js";

export class Backend {
  constructor(projectURL, config) {
    this.projectURL = projectURL;
    this.config = config;
    this.skjemaUtfylling = new GitHubRepo("navikt", config.publishRepo, config.publishRepoToken);
  }

  ho() {
    return "flups";
  }

  getProjectURL() {
    return this.projectURL;
  }

  getGitURL() {
    return this.config.workflowDispatchURL;
  }

  async checkUpdateAndPublishingAccess(userToken) {
    //Her kan vi vurdere nærmere sjekk, men man når ikke denne siden uten å være pålogget.
    const currentUserUrl = `${this.projectURL}/current`;
    return fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
  }

  async updateForms(userToken, forms) {
    const updateFormUrl = "https://formio-api-server.ekstern.dev.nav.no/form";
    await this.checkUpdateAndPublishingAccess(userToken);
    return await Promise.all(
      forms.map((form) => {
        return fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-jwt-token": userToken,
          },
          body: JSON.stringify(form),
        }).then((migratedForm) => migratedForm.data);
      })
    );
  }

  areEqualWithoutWhiteSpaces(string1, string2) {
    return string1.replace(/\s/g, "") === string2.replace(/\s/g, "");
  }

  async pushJsonFileToRepo(branch, path, message, file) {
    const content = stringTobase64(JSON.stringify(file), "utf-8");
    const remoteFile = await this.skjemaUtfylling.getFileIfItExists(branch, path);
    const sha = remoteFile && remoteFile.data && remoteFile.data.sha;

    if (
      remoteFile &&
      remoteFile.data &&
      remoteFile.data.content &&
      this.areEqualWithoutWhiteSpaces(remoteFile.data.content, content)
    ) {
      // The file exists remotely, and is identical to the "local" file. Skip update.
      return Promise.resolve(undefined);
    }

    const createResult = await this.skjemaUtfylling.createOrUpdateFileContents(branch, path, message, content, sha);
    return createResult.data.commit.sha;
  }

  async performChangesOnSeparateBranch(base, branch, performChanges) {
    const baseBranch = await this.skjemaUtfylling.getRef(base);
    await this.skjemaUtfylling.createRef(branch, baseBranch.data.object.sha);

    await performChanges(branch);

    const currentRef = await this.skjemaUtfylling.getRef(branch);
    let updatedBaseSha;
    if (baseBranch.data.object.sha !== currentRef.data.object.sha) {
      // Only create and merge pull request if the branch contains changes, compared to the base branch
      const pullRequest = await this.skjemaUtfylling.createPullRequest("Automatic publishing job", branch, base);
      await this.skjemaUtfylling.mergePullRequest(pullRequest.data.number);
      const updatedBase = await this.skjemaUtfylling.getRef(base);
      updatedBaseSha = updatedBase.data.object.sha;
    }

    await this.skjemaUtfylling.deleteRef(branch);
    return updatedBaseSha;
  }

  pushFormAndTranslationsCallback(formPath, form, translations) {
    return async (branch) => {
      await this.pushJsonFileToRepo(
        branch,
        `translations/${formPath}.json`,
        `[Publisering] oversettelse "${form.title}", monorepo ref: ${this.config.gitSha}`,
        translations
      );
      await this.pushJsonFileToRepo(
        branch,
        `forms/${formPath}.json`,
        `[Publisering] skjema "${form.title}", monorepo ref: ${this.config.gitSha}`,
        form
      );
    };
  }

  async publishForm(userToken, form, translations, formPath) {
    await this.checkUpdateAndPublishingAccess(userToken);
    return this.performChangesOnSeparateBranch(
      this.config.publishRepoBaseBranch,
      `publish-${formPath}--${guid()}`,
      this.pushFormAndTranslationsCallback(formPath, form, translations)
    );
  }

  async publishResource(userToken, resourceName, resourceContent) {
    await this.checkUpdateAndPublishingAccess(userToken);
    return this.pushJsonFileToRepo(
      this.config.publishRepoBaseBranch,
      `resources/${resourceName}.json`,
      `[Publisering] ressurs "${resourceName}", monorepo ref: ${this.config.gitSha}`,
      resourceContent
    );
  }

  async authenticateWithAzure() {
    const postData = {
      grant_type: "client_credentials",
      scope: `openid api://${this.config.skjemabyggingProxyClientId}/.default`,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      client_auth_method: "client_secret_basic",
    };
    const body = qs.stringify(postData);
    return fetchWithErrorHandling(this.config.azureOpenidTokenEndpoint, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: body,
    });
  }

  async fetchEnhetsliste() {
    return this.authenticateWithAzure().then(({ data }) => {
      return fetchWithErrorHandling(`${this.config.skjemabyggingProxyUrl}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
        headers: { Authorization: `Bearer ${data?.access_token}` },
      }).then((response) => response.data);
    });
  }
}
