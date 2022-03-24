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
    const baseRef = await this.skjemaUtfylling.getRef(base);
    await this.skjemaUtfylling.createRef(branch, baseRef.data.object.sha);

    await performChanges(branch);

    let updatedBaseSha;
    if (await this.skjemaUtfylling.hasBranchChanged(baseRef, branch)) {
      // Only create and merge pull request if the branch contains changes, compared to the base branch
      const pullRequest = await this.skjemaUtfylling.createPullRequest("Automatic publishing job", branch, base);
      await this.skjemaUtfylling.mergePullRequest(pullRequest.data.number);
      const updatedBase = await this.skjemaUtfylling.getRef(base);
      updatedBaseSha = updatedBase.data.object.sha;
    }

    await this.skjemaUtfylling.deleteRef(branch);
    return updatedBaseSha;
  }

  pushFilesAndUpdateSubmoduleCallback(files) {
    return async (branch) => {
      const initialRef = await this.skjemaUtfylling.getRef(branch);

      for (const file of files) {
        await this.pushJsonFileToRepo(
          branch,
          file.path,
          `[Publisering] ${file.type} "${file.name}", monorepo ref: ${this.config.gitSha}`,
          file.content
        );
      }

      if (await this.skjemaUtfylling.hasBranchChanged(initialRef, branch)) {
        await this.skjemaUtfylling.updateSubmodule(
          branch,
          this.config.gitSha,
          this.config.submoduleRepo,
          `[Publisering] oppdater monorepo ref: ${this.config.gitSha}`
        );
      }
    };
  }

  async publishForm(userToken, formContent, translationsContent, formPath) {
    const form = {
      name: formContent.title,
      path: `forms/${formPath}.json`,
      type: "skjema",
      content: formContent,
    };
    const translations = {
      name: formContent.title,
      path: `translations/${formPath}.json`,
      type: "oversettelse",
      content: translationsContent,
    };

    await this.checkUpdateAndPublishingAccess(userToken);
    return this.performChangesOnSeparateBranch(
      this.config.publishRepoBase,
      `publish-${formPath}--${guid()}`,
      this.pushFilesAndUpdateSubmoduleCallback([translations, form])
    );
  }

  async publishResource(userToken, resourceName, resourceContent) {
    const resource = {
      name: resourceName,
      path: `resources/${resourceName}.json`,
      type: "ressurs",
      content: resourceContent,
    };

    await this.checkUpdateAndPublishingAccess(userToken);
    return this.performChangesOnSeparateBranch(
      this.config.publishRepoBase,
      `publish-${resourceName}--${guid()}`,
      this.pushFilesAndUpdateSubmoduleCallback([resource])
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
