import { Redirect, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useSendInn } from "../context/sendInn/sendInnContext";
import { LoadingComponent } from "../index";

export const SubmissionWrapper = ({ submission, url, children }) => {
  const { search } = useLocation();
  const { featureToggles } = useAppConfig();
  const { isMellomlagringReady } = useSendInn();
  const innsendingsId = new URLSearchParams(search).get("innsendingsId");

  if (featureToggles.enableMellomlagring && innsendingsId && !isMellomlagringReady) {
    return <LoadingComponent />;
  }

  if (!submission) {
    return <Redirect to={`${url}${search}`} />;
  }
  return children(submission);
};
