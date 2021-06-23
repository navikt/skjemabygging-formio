import { useHistory, useParams } from "react-router-dom";

const useLanguageCodeFromURL = () => {
  // Language code in skjemabygger URL
  const { languageCode } = useParams();

  // Language code as URL parameter in FyllUt
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const langQueryParam = params.get("lang");

  // Return either language code found
  return langQueryParam || languageCode;
};

export default useLanguageCodeFromURL;
