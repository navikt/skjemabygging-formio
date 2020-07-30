import {fetchWithErrorHandling, stringTobase64} from "./fetchUtils.js";

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

export async function getListOfPreviouslyPublishedForms(gitUrl, userName, password) {
  return fetchWithErrorHandling(gitUrl, {
    method: "get",
    headers: {
      Authorization: "Basic " + stringTobase64(`${userName}:${password}`),
      "Content-Type": "application/json",
    },
  });
}

export function getShaIfFormIsPreviouslyPublished(listOfForms, formFileName) {
  const previouslyPublishedForm = listOfForms.find((content) => content.name === formFileName);
  return previouslyPublishedForm ? previouslyPublishedForm.sha : undefined;
}

export async function publishUpdateToForm(formFileName, formContent, sha, gitUrl, userName, password) {
  const updateFileContent = {
    message: `Oppdatert versjon av ${formFileName}`,
    content: stringTobase64(JSON.stringify(formContent)),
    sha: sha,
  };

  const result = await createOrUpdateFormInGH(formFileName, updateFileContent, gitUrl, userName, password);
  if (result.status !== "OK") {
    console.error("Klarte ikke å publisere oppdatering av form i github, ", result.statusText);
    return { status: "FAILED" }
  }
  return result;
}

export async function publishNewForm(formFileName, formContent, gitUrl, userName, password) {
  const newFileContent = {
    message: `Nytt skjema ${formFileName}`,
    content: stringTobase64(JSON.stringify(formContent)),
  };

  const result = await createOrUpdateFormInGH(formFileName, newFileContent, gitUrl, userName, password);
  if (result.status !== "OK") {
    console.error("Klarte ikke å publisere nytt form i github, status: ", result.status);
    return { status: "FAILED" }
  }
  return result;
}

async function createOrUpdateFormInGH(formFileName, body, gitUrl, userName, password) {
  const formUrl = `${gitUrl}/${formFileName}`;

  return await fetchWithErrorHandling(formUrl, {
    method: "put",
    body: JSON.stringify(body),
    headers: {
      Authorization: "Basic " + stringTobase64(`${userName}:${password}`),
      "Content-Type": "application/json",
    },
  });
}

