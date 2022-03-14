import { url } from "@navikt/skjemadigitalisering-shared-components";

const getDefaultHeaders = (queryString: string) => {
  const submissionMethod = url.getUrlParam(queryString, "sub");
  return {
    "Fyllut-Submission-Method": submissionMethod,
  }
}

export {
  getDefaultHeaders,
}