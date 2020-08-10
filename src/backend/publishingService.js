import {fetchWithErrorHandling, stringTobase64} from "./fetchUtils.js";
import jwt from 'jsonwebtoken';

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

export async function getGithubToken(ghAppID, ghKey, ghInstallationID, gitUrl) {
  const timeInMillis = Date.now();
  const timeInSeconds = Math.floor(timeInMillis / 1000);
  const payload = {
    iat: timeInSeconds,
    exp: timeInSeconds + (10 * 60),
    iss: ghAppID
  };

  const token = await jwt.sign(payload, ghKey, { algorithm: 'RS256' });
  return fetchWithErrorHandling(`${gitUrl}app/installations/${ghInstallationID}/access_tokens`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.machine-man-preview+json",
    },
  });
}

export async function getListOfPreviouslyPublishedForms(gitUrl, ghToken) {
  return fetchWithErrorHandling(gitUrl, {
    method: "get",
    headers: {
      Authorization: "token " + ghToken,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.machine-man-preview+json"
    },
  });
}

export function getShaIfFormIsPreviouslyPublished(listOfForms, formFileName) {
  const previouslyPublishedForm = listOfForms.find((content) => content.name === formFileName);
  return previouslyPublishedForm ? previouslyPublishedForm.sha : undefined;
}

export async function publishUpdateToForm(formFileName, formContent, shaOfPreviouslyPublished, gitUrl, token) {
  const updateFileContent = {
    message: `Oppdatert versjon av ${formFileName}`,
    content: stringTobase64(JSON.stringify(formContent)),
    sha: shaOfPreviouslyPublished,
  };

  const result = await createOrUpdateFormInGH(formFileName, updateFileContent, gitUrl, token);
  if (result.status !== "OK") {
    console.error("Klarte ikke å publisere oppdatering av form i github, ", result.statusText);
    return { status: "FAILED" }
  }
  return result;
}

export async function publishNewForm(formFileName, formContent, gitUrl, ghToken) {
  const newFileContent = {
    message: `Nytt skjema ${formFileName}`,
    content: stringTobase64(JSON.stringify(formContent)),
  };

  const result = await createOrUpdateFormInGH(formFileName, newFileContent, gitUrl, ghToken);
  if (result.status !== "OK") {
    console.error("Klarte ikke å publisere nytt form i github, status: ", result.status);
    return { status: "FAILED" }
  }
  return result;
}

async function createOrUpdateFormInGH(formFileName, body, gitUrl, ghToken) {
  const formUrl = `${gitUrl}/${formFileName}`;

  return await fetchWithErrorHandling(formUrl, {
    method: "put",
    body: JSON.stringify(body),
    headers: {
      Authorization: "token " + ghToken,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.machine-man-preview+json"
    },
  });
}

