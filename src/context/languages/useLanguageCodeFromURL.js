import { useHistory, useParams } from "react-router-dom";

const defaultLanguage = "nb-NO";

const useLanguageCodeFromURL = () => {
  // Language code in skjemabygger URL
  const { languageCode } = useParams();

  // Language code as URL parameter in FyllUt
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const langQueryParam = params.get("lang");

  // Return either language code found
  return langQueryParam || languageCode || defaultLanguage;
};

export default useLanguageCodeFromURL;
