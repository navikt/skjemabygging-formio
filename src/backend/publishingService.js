import { base64ToString, fetchWithErrorHandling, stringTobase64 } from "./fetchUtils.js";
import jwt from "jsonwebtoken";

export async function checkPublishingAccess(userToken, projectUrl) {
  //Her kan vi vurdere nærmere sjekk, men man når ikke denne siden uten å være pålogget.
  const currentUserUrl = `${projectUrl}/current`;
  return fetchWithErrorHandling(currentUserUrl, {
    headers: {
      "Content-Type": "application/json",
      "x-jwt-token": userToken,
    },
  });
}

export async function getGithubToken(gh) {
  const timeInMillis = Date.now();
  const timeInSeconds = Math.floor(timeInMillis / 1000);
  const payload = {
    iat: timeInSeconds,
    exp: timeInSeconds + 10 * 60,
    iss: gh.appID,
  };

  const token = await jwt.sign(payload, gh.key, { algorithm: "RS256" });
  return fetchWithErrorHandling(`${gh.baseURL}app/installations/${gh.installationID}/access_tokens`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.machine-man-preview+json",
    },
  });
}

export function getShaIfFormIsPreviouslyPublished(listOfForms, formFileName) {
  const previouslyPublishedForm = listOfForms.find((content) => content.name === formFileName);
  return previouslyPublishedForm ? previouslyPublishedForm.sha : undefined;
}

export class PublishingService {
  constructor(ghToken, repoUrl, ref) {
    this.ghToken = ghToken;
    this.repoUrl = repoUrl;
    this.gitRef = ref;
  }

  skjemaFolderBase() {
    return `${this.repoUrl}/contents/skjema`;
  }

  skjemaFolderUrl() {
    return `${this.skjemaFolderBase()}?ref=${this.gitRef}`;
  }

  packageJsonUrl() {
    return `${this.repoUrl}/contents/package.json?ref=${this.gitRef}`;
  }

  formUrl(formFileName) {
    return `${this.skjemaFolderBase()}/${formFileName}?ref=${this.gitRef}`;
  }

  gitRefUrl() {
    return `${this.repoUrl}/git/refs/heads/${this.gitRef}`;
  }

  tempGitRefUrl() {
    return `${this.repoUrl}/git/refs/heads/${this.tempGitRef()}`;
  }

  refsUrl() {
    return `${this.repoUrl}/git/refs`;
  }

  tempGitRef() {
    return `${this.gitRef}-temp`;
  }

  async publishForm(formPath, form) {
    const listOfFormsResponse = await this.getListOfPreviouslyPublishedForms();

    if (listOfFormsResponse.status !== "OK") {
      return {status: "FAILED"};
    }

    const formFileName = `${formPath}.json`;
    const listOfForms = listOfFormsResponse.data;
    const shaOfPreviouslyPublishedForm = getShaIfFormIsPreviouslyPublished(listOfForms, formFileName);
    console.log("forms", listOfForms);
    if (shaOfPreviouslyPublishedForm) {
      return this.publishUpdateToForm(formFileName, form, shaOfPreviouslyPublishedForm);
    } else {
      return this.publishNewForm(formFileName, form);
    }
  }

  async getListOfPreviouslyPublishedForms() {
    return fetchWithErrorHandling(this.skjemaFolderUrl(), {
      method: "get",
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  }

  async publishUpdateToForm(formFileName, formContent, shaOfPreviouslyPublished) {
    const updateFileContent = {
      message: `Oppdatert versjon av ${formFileName} fra koselig med peis`,
      content: stringTobase64(JSON.stringify(formContent)),
      branch: this.tempGitRef(),
      sha: shaOfPreviouslyPublished,
    };

    const result = await this.createOrUpdateFormInGH(formFileName, updateFileContent);
    if (result.status !== "OK") {
      console.error("Klarte ikke å publisere oppdatering av form i github, ", result);
      return { status: "FAILED" };
    }
    return result;
  }

  async publishNewForm(formFileName, formContent) {
    const newFileContent = {
      message: `Nytt skjema ${formFileName}`,
      content: stringTobase64(JSON.stringify(formContent)),
      branch: this.tempGitRef(),
    };

    const result = await this.createOrUpdateFormInGH(formFileName, newFileContent);
    if (result.status !== "OK") {
      console.error("Klarte ikke å publisere nytt form i github, status: ", result.status);
      return { status: "FAILED" };
    }
    return result;
  }

  // TODO: refactor to use createOrUpdateContentInGH.
  async createOrUpdateFormInGH(formFileName, body) {
    return await fetchWithErrorHandling(this.contentsUrl(`skjema/${formFileName}`), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  }

  async createOrUpdateContentInGH(filePath, body) {
    return await fetchWithErrorHandling(this.contentsUrl(filePath), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  }

  async makeTempGitRef() {
    const response = await fetchWithErrorHandling(this.gitRefUrl());
    console.log(response);
    const message = {
      sha: response.data.object.sha,
      ref: `refs/heads/${this.tempGitRef()}`,
    };
    return await fetchWithErrorHandling(this.refsUrl(), {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  }

  async packageJsonObject() {
    const response = await fetchWithErrorHandling(this.packageJsonUrl());
    const content = base64ToString(response.data.content);
    const sha = response.data.sha;
    return [JSON.parse(content), sha];
  }

  async updatePackageJson(currentSkjemabyggingSha) {
    const [packageJson, sha] = await this.packageJsonObject();
    console.log(packageJson);
    packageJson.dependencies["skjemabygging-formio"] = `github:navikt/skjemabygging-formio#${currentSkjemabyggingSha}`;
    const updateResponse = await this.updatePackageJsonContent(packageJson, sha);
    return updateResponse;
  }

  async updatePackageJsonContent(packageJson, shaOfPreviouslyPublished) {
    const updateFileContent = {
      message: `Oppdaterer package json`,
      content: stringTobase64(JSON.stringify(packageJson, null, 2)),
      branch: this.tempGitRef(),
      sha: shaOfPreviouslyPublished,
    };

    const result = await this.createOrUpdateContentInGH("package.json", updateFileContent);
    if (result.status !== "OK") {
      console.error("Klarte ikke å publisere oppdatering av form i github, ", result);
      return { status: "FAILED" };
    }
    return result;
  }

  contentsUrl(filePath) {
    return `${this.repoUrl}/contents/${filePath}`;
  }

  async updateRefFromTempRef() {
    const tempRefResponse = await fetchWithErrorHandling(this.tempGitRefUrl());
    console.log(tempRefResponse);
    const tempRefSha = tempRefResponse.data.object.sha;
    return await fetchWithErrorHandling(this.gitRefUrl(), {
      method: "PATCH",
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sha: tempRefSha,
        force: false,
      }),
    });
  }

  async updateFromAndDeleteTempRef() {
    const response = await this.updateRefFromTempRef();
    console.log(response);
    const deleteResponse = await this.deleteTempRef();
    console.log(deleteResponse);
  }

  async deleteTempRef() {
    return await fetchWithErrorHandling(
      this.tempGitRefUrl(),
      {
        method: 'DELETE',
        headers: {Authorization: "token " + this.ghToken}
      }
    )
  }
}
