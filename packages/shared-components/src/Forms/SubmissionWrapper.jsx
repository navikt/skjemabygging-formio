import { Redirect, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { ErrorPage, LoadingComponent } from "../index";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  const { featureToggles } = useAppConfig();
  const { isMellomlagringReady, mellomlagringError } = useSendInn();
  const innsendingsId = new URLSearchParams(search).get("innsendingsId");

  if (mellomlagringError) {
    //TODO: bedre visning av feilmeldinger
    return <ErrorPage errorMessage={mellomlagringError.status === 404 ? "Fant ikke søknaden" : "Noe galt skjedde"} />;
  }

  if (featureToggles.enableMellomlagring && innsendingsId && !isMellomlagringReady) {
    return <LoadingComponent />;
  }

  if (!submission) {
    return <Redirect to={`${url}${search}`} />;
  }
  return children(submission);
};
