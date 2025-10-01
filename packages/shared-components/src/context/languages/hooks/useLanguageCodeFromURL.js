import { useParams, useSearchParams } from 'react-router';

const useLanguageCodeFromURL = () => {
  // Language code in skjemabygger URL
  const { languageCode } = useParams();

  // Language code as URL parameter in FyllUt
  const [searchParams] = useSearchParams();
  const langQueryParam = searchParams.get('lang');

  // Return either language code found
  return langQueryParam || languageCode;
};

export default useLanguageCodeFromURL;
