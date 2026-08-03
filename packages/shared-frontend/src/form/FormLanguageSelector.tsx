import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { useSubmissionState } from '../context/state/SubmissionStateContext';
import { persistStepperOpenStateForLanguageChange } from './wizard/stepperOpenState';

const languagesInOriginalLanguage: Record<string, string> = {
  'nb-NO': 'Norsk bokmål',
  'nn-NO': 'Norsk nynorsk',
  en: 'English',
  pl: 'Polskie',
};
const FYLLUT_BASE_PATH = '/fyllut';

const FormLanguageSelector = () => {
  const { currentLanguage, availableLanguages } = useFyllutLanguage();
  const { submission } = useSubmissionState();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const supportedLanguages = useMemo(() => {
    const languages = [...availableLanguages];

    if (currentLanguage !== 'nb-NO' && !languages.includes('nb-NO')) {
      languages.push('nb-NO');
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
          href: `${FYLLUT_BASE_PATH}${pathname}?${params.toString()}`,
          label: languagesInOriginalLanguage[languageCode] ?? languageCode,
        };
      });
  }, [currentLanguage, pathname, search, supportedLanguages]);

  if (options.length === 0) {
    return null;
  }

  const label = languagesInOriginalLanguage[currentLanguage] ?? 'Norsk bokmål';
  const navigationState =
    typeof state === 'object' && state
      ? {
          ...state,
          initialSubmission: submission,
          preserveInitialSubmission: true as const,
        }
      : {
          initialSubmission: submission,
          preserveInitialSubmission: true as const,
        };

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
                  const stepperOpen = persistStepperOpenStateForLanguageChange();
                  navigate(
                    {
                      pathname,
                      search: new URL(option.href, window.location.origin).search,
                    },
                    { state: { ...navigationState, stepperOpen } },
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
