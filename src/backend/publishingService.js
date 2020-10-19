import { base64ToString, fetchWithErrorHandling, stringTobase64, HttpError } from "./fetchUtils.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

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
  try {
    return await fetchWithErrorHandling(`${gh.baseURL}app/installations/${gh.installationID}/access_tokens`, {
      method: "post",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  } catch (error) {
    if (error instanceof HttpError && error.response.status === 401) {
      throw new ServerError("When trying to obtain access_token: Machine user token is Unauthorized");
    }
    throw error;
  }
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
    this.uniqueId = uuidv4();
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
    return `${this.gitRef}-${this.uniqueId}`;
  }

  async publishForm(formPath, form) {
    const listOfFormsResponse = await this.getListOfPreviouslyPublishedForms();
    const formFileName = `${formPath}.json`;
    const listOfForms = listOfFormsResponse.data;
    const shaOfPreviouslyPublishedForm = getShaIfFormIsPreviouslyPublished(listOfForms, formFileName);
    if (shaOfPreviouslyPublishedForm) {
      await this.publishUpdateToForm(formFileName, form, shaOfPreviouslyPublishedForm);
    } else {
      await this.publishNewForm(formFileName, form);
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
    await this.createOrUpdateFormInGH(formFileName, updateFileContent);
  }

  async publishNewForm(formFileName, formContent) {
    const newFileContent = {
      message: `Nytt skjema ${formFileName}`,
      content: stringTobase64(JSON.stringify(formContent)),
      branch: this.tempGitRef(),
    };
    await this.createOrUpdateFormInGH(formFileName, newFileContent);
  }

  async createOrUpdateFormInGH(formFileName, body) {
    return await this.createOrUpdateContentInGH(`skjema/${formFileName}`, body);
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

  async createTempCopyOfGitRef() {
    const response = await fetchWithErrorHandling(this.gitRefUrl(), {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
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

  async getPackageJsonObject() {
    const response = await fetchWithErrorHandling(this.packageJsonUrl());
    const content = base64ToString(response.data.content);
    const sha = response.data.sha;
    return [JSON.parse(content), sha];
  }

  async updatePackageJson(currentSkjemabyggingSha) {
    const [packageJson, sha] = await this.getPackageJsonObject();
    console.log(packageJson);
    packageJson.dependencies["skjemabygging-formio"] = `github:navikt/skjemabygging-formio#${currentSkjemabyggingSha}`;
    await this.updatePackageJsonContent(packageJson, sha);
  }

  async updatePackageJsonContent(packageJson, shaOfPreviouslyPublished) {
    const commitPayload = {
      message: `Oppdaterer package json`,
      content: stringTobase64(JSON.stringify(packageJson, null, 2)),
      branch: this.tempGitRef(),
      sha: shaOfPreviouslyPublished,
    };

    return await this.createOrUpdateContentInGH("package.json", commitPayload);
  }

  contentsUrl(filePath) {
    return `${this.repoUrl}/contents/${filePath}`;
  }

  async updateGitRefFromTempGitRef() {
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
    await this.updateGitRefFromTempGitRef();
    await this.deleteTempRef();
  }

  async deleteTempRef() {
    return await fetchWithErrorHandling(this.tempGitRefUrl(), {
      method: "DELETE",
      headers: { Authorization: "token " + this.ghToken },
    });
  }
}
