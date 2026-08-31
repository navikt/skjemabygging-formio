import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../../context/language/LanguageContext';
import { withoutSubmissionNavigationState } from '../../utils/navigationState';
import { useFyllut } from '../context/fyllut/FyllutContext';

const languagesInOriginalLanguage: Record<string, string> = {
  nb: 'Norsk bokmål',
  nn: 'Norsk nynorsk',
  en: 'English',
  pl: 'Polskie',
};
const FormLanguageSelector = () => {
  const { currentLanguage, availableLanguages } = useLanguage();
  const { fyllutBaseUrl } = useFyllut();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const supportedLanguages = useMemo(() => {
    const languages = [...availableLanguages];

    if (currentLanguage !== 'nb' && !languages.includes('nb')) {
      languages.push('nb');
    }

    return languages;
  }, [availableLanguages, currentLanguage]);

  const options = useMemo(() => {
    return supportedLanguages
      .filter((languageCode) => languageCode !== currentLanguage)
      .map((languageCode) => {
        const params = new URLSearchParams(search);
        params.set('lang', languageCode);

        return {
          href: `${fyllutBaseUrl}${pathname}?${params.toString()}`,
          label: languagesInOriginalLanguage[languageCode] ?? languageCode,
        };
      });
  }, [currentLanguage, fyllutBaseUrl, pathname, search, supportedLanguages]);

  if (options.length === 0) {
    return null;
  }

  const label = languagesInOriginalLanguage[currentLanguage] ?? 'Norsk bokmål';
  const navigationState = withoutSubmissionNavigationState(state);

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', position: 'relative' }}>
      <div>
        <button type="button" onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
          {label}
        </button>
        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              marginTop: '0.25rem',
              background: 'white',
              border: '1px solid var(--a-border-default)',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 1,
            }}
          >
            {options.map((option) => (
              <a
                key={option.href}
                href={option.href}
                onClick={(event) => {
                  event.preventDefault();
                  setOpen(false);
                  navigate(
                    {
                      pathname,
                      search: new URL(option.href, window.location.origin).search,
                    },
                    { state: navigationState },
                  );
                }}
              >
                {option.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLanguageSelector;
