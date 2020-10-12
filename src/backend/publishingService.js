import { fetchWithErrorHandling, stringTobase64 } from "./fetchUtils.js";
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

  formUrl(formFileName) {
    return `${this.skjemaFolderBase()}/${formFileName}?ref=${this.gitRef}`;
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
      branch: this.gitRef,
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
    };

    const result = await this.createOrUpdateFormInGH(formFileName, newFileContent);
    if (result.status !== "OK") {
      console.error("Klarte ikke å publisere nytt form i github, status: ", result.status);
      return { status: "FAILED" };
    }
    return result;
  }

  async createOrUpdateFormInGH(formFileName, body) {
    return await fetchWithErrorHandling(this.formUrl(formFileName), {
      method: "put",
      body: JSON.stringify(body),
      headers: {
        Authorization: "token " + this.ghToken,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.machine-man-preview+json",
      },
    });
  }
}
