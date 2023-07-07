import { Redirect, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { ErrorPage, LoadingComponent } from "../index";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  const { featureToggles } = useAppConfig();
  const { isMellomlagringReady, mellomlagringError } = useSendInn();
  const innsendingsId = new URLSearchParams(search).get("innsendingsId");
  const expectsSavedSubmissionFromMellomlagring = featureToggles.enableMellomlagring && innsendingsId;

  if (mellomlagringError) {
    //TODO: bedre visning av feilmeldinger
    return <ErrorPage errorMessage={mellomlagringError.status === 404 ? "Fant ikke søknaden" : "Noe galt skjedde"} />;
  }

  if (expectsSavedSubmissionFromMellomlagring && !isMellomlagringReady) {
    return <LoadingComponent />;
  }

  if (!expectsSavedSubmissionFromMellomlagring && !submission) {
    return <Redirect to={`${url}${search}`} />;
  }
  return children(submission);
};
