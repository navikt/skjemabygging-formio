import { guid } from "nav-frontend-js-utils";
import { Octokit } from "octokit";
import qs from "qs";
import { promisify } from "util";
import { gunzip, gzip } from "zlib";
import { fetchWithErrorHandling, stringTobase64 } from "./fetchUtils.js";
const promisifiedGzip = promisify(gzip);
const promisifiedGunzip = promisify(gunzip);

export class Backend {
  constructor(projectURL, config) {
    this.projectURL = projectURL;
    this.config = config;
    this.octokit = new Octokit({ auth: config.workflowDispatchToken });
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

  async toBase64GzipAndJson(data) {
    const buffer = Buffer.from(JSON.stringify(data), "utf-8");
    const zippedBuffer = await promisifiedGzip(buffer);
    return zippedBuffer.toString("base64");
  }

  async fromBase64GzipAndJson(string) {
    const buffer = Buffer.from(string, "base64");
    const inflated = await promisifiedGunzip(buffer);
    return JSON.parse(inflated.toString());
  }

  async payload(formJsonFileTitle, form, translations) {
    const encodedForm = await this.toBase64GzipAndJson(form);
    const encodedTranslations = await this.toBase64GzipAndJson(translations);
    return {
      ref: this.config.workflowDispatchRef,
      inputs: {
        formJsonFileTitle,
        formDescription: form.title,
        encodedTranslationJson: encodedTranslations,
        encodedFormJson: encodedForm,
        monorepoGitHash: this.config.gitSha,
      },
    };
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

  async getRemoteFileIfItExists(owner, repo, ref, path) {
    let remoteFileContent;
    try {
      remoteFileContent = await this.octokit.rest.repos.getContent({ owner, repo, ref, path });
    } catch (e) {}
    return remoteFileContent;
  }

  areEqualWithoutWhiteSpaces(string1, string2) {
    return string1.replace(/\s/g, "") === string2.replace(/\s/g, "");
  }

  async pushJsonFileToRepo(owner, repo, branch, path, message, file) {
    const content = stringTobase64(JSON.stringify(file), "utf-8");
    const remoteFile = await this.getRemoteFileIfItExists(owner, repo, branch, path);
    const sha = remoteFile && remoteFile.data && remoteFile.data.sha;
    const params = {
      owner,
      repo,
      branch,
      path,
      message,
      content,
    };

    if (
      remoteFile &&
      remoteFile.data &&
      remoteFile.data.content &&
      this.areEqualWithoutWhiteSpaces(remoteFile.data.content, content)
    ) {
      // The file exists remotely, and is identical to the "local" file. Skip update.
      return Promise.resolve(undefined);
    }

    if (sha) {
      // The file exists remotely. Update content.
      const updateResult = await this.octokit.rest.repos.createOrUpdateFileContents({ ...params, sha });
      return updateResult.data.commit.sha;
    }

    // The file doesn't exist remotely. Create new file.
    const createResult = await this.octokit.rest.repos.createOrUpdateFileContents(params);
    return createResult.data.commit.sha;
  }

  async performChangesOnSeparateBranch(owner, repo, base, branch, performChanges) {
    const baseBranch = await this.octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${base}`,
    });

    await this.octokit.rest.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: baseBranch.data.object.sha,
    });

    await performChanges(owner, repo, branch);

    const currentRef = await this.octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
    let updatedBaseSha;

    if (baseBranch.data.object.sha !== currentRef.data.object.sha) {
      // Only create and merge pull request if the branch contains changes, compared to the base branch
      const pullRequest = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title: "Automatic publishing job",
        head: branch,
        base,
      });
      await this.octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: pullRequest.data.number,
      });
      const updatedBase = await this.octokit.rest.git.getRef({ owner, repo, ref: `heads/${base}` });
      updatedBaseSha = updatedBase.data.object.sha;
    }

    await this.octokit.rest.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
    return updatedBaseSha;
  }

  pushFormAndTranslationsCallback(formPath, form, translations) {
    return async (owner, repo, branch) => {
      await this.pushJsonFileToRepo(
        owner,
        repo,
        branch,
        `translations/${formPath}.json`,
        `Publishing translations for ${formPath}`,
        translations
      );
      await this.pushJsonFileToRepo(
        owner,
        repo,
        branch,
        `forms/${formPath}.json`,
        `Publishing form: ${form.properties.skjemanummer} - ${form.title}`,
        form
      );
    };
  }

  async publishForm(userToken, form, translations, formPath) {
    await this.checkUpdateAndPublishingAccess(userToken);
    return this.performChangesOnSeparateBranch(
      "navikt",
      "skjemapublisering-monorepo-poc",
      "test-publish",
      `publish-${formPath}--${guid()}`,
      this.pushFormAndTranslationsCallback(formPath, form, translations)
    );
  }

  async publishResource(userToken, resourceName, resourceContent) {
    await this.checkUpdateAndPublishingAccess(userToken);
    return this.pushJsonFileToRepo(
      "navikt",
      "skjemapublisering-monorepo-poc",
      "test-publish",
      `resources/${resourceName}.json`,
      `Publishing resource: ${resourceName}`,
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
