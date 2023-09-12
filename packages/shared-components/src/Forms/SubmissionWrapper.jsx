import { Redirect, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { ErrorPage, LoadingComponent } from "../index";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  const { featureToggles } = useAppConfig();
  const { isMellomlagringReady, mellomlagringError } = useSendInn();
  const innsendingsId = new URLSearchParams(search).get("innsendingsId");
  const expectsSavedSubmissionFromMellomlagring = featureToggles.enableMellomlagring && !!innsendingsId;

  const removeParamIfItExists = (searchParamsString, param) => {
    const urlSearchParams = new URLSearchParams(searchParamsString);
    if (urlSearchParams.get(param)) {
      urlSearchParams.delete(param);
      return `?${urlSearchParams.toString()}`;
    }
    return searchParamsString;
  };

  if (mellomlagringError && mellomlagringError.type === "NOT FOUND") {
    return <ErrorPage errorMessage={mellomlagringError.message} />;
  }

  if (expectsSavedSubmissionFromMellomlagring && !isMellomlagringReady) {
    return <LoadingComponent />;
  }

  if (!expectsSavedSubmissionFromMellomlagring && !submission) {
    return <Redirect to={`${url}${removeParamIfItExists(search, "innsendingsId")}`} />;
  }
  return (
    <>
      {children(submission)}
      <div id="formio-summary-hidden" hidden />
    </>
  );
};
