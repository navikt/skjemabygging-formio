import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { fireEvent, render, screen } from '@testing-library/react';
import { AppConfigProvider } from '../../context/config/configContext';
import { LanguagesProvider } from '../../context/languages';
import DigitalSubmissionWithPrompt from './DigitalSubmissionWithPrompt';

vi.mock('../../context/languages/hooks/useLanguageCodeFromURL', () => {
  return {
    default: () => 'nb-NO',
  };
});

const onError = vi.fn();

describe('DigitalSubmissionWithPrompt', () => {
  const BASE_URL = 'http://www.unittest.nav.no/fyllut';

  beforeEach(() => {
    render(
      <AppConfigProvider baseUrl={BASE_URL} app="fyllut">
        <LanguagesProvider translations={{}}>
          <DigitalSubmissionWithPrompt submission={{} as Submission} onError={onError} />
        </LanguagesProvider>
      </AppConfigProvider>,
    );
  });

  it('renders "Send to Nav"-button', () => {
    expect(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open })).toBeInTheDocument();
  });

  it('renders modal with "DigitalSubmissionButton" when "Send to Nav" is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.open }));
    expect(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.confirm })).toBeInTheDocument();
  });
});
