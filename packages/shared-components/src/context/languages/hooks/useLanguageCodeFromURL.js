import { useLocation, useParams, useSearchParams } from 'react-router-dom';

const useLanguageCodeFromURL = () => {
  // Language code in skjemabygger URL
  const { languageCode } = useParams();
  const location = useLocation();

  // Language code in fyllut URL
  const languageMatch = location.pathname.match(/\/(nb|nn|en)\//);

  // Language code as URL parameter in FyllUt (depricated)
  const [searchParams] = useSearchParams();
  const langQueryParam = searchParams.get('lang');

  // Return language code found
  return languageMatch?.[1] || langQueryParam || languageCode;
};

export default useLanguageCodeFromURL;
