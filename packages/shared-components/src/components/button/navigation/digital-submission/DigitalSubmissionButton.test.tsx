import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { AppConfigContextType, AppConfigProvider } from '../../../../context/config/configContext';
import { FormProvider } from '../../../../context/form/FormContext';
import { LanguagesProvider } from '../../../../context/languages';
import { SendInnProvider } from '../../../../context/sendInn/sendInnContext';
import DigitalSubmissionButton, { Props } from './DigitalSubmissionButton';

vi.mock('../../context/languages/hooks/useLanguageCodeFromURL', () => {
  return {
    default: () => 'nb-NO',
  };
});

vi.mock('react-router', async () => {
  const actual = await vi.importActual<object>('react-router');
  const params = new URLSearchParams();
  params.set('innsendingsId', '6895e72c-bd59-4964-a098-822c4a83799c');
  params.set('lang', 'nb');
  return {
    ...actual,
    useSearchParams: vi.fn().mockReturnValue([params, vi.fn()]),
  };
});

const BASE_URL = 'http://www.unittest.nav.no/fyllut';
const SEND_INN_URL = 'http://www.unittest.nav.no/sendInn/soknad/123';

const originalWindowLocation = window.location;

const defaultAppConfigProps: Partial<AppConfigContextType> = {
  baseUrl: BASE_URL,
  app: 'fyllut',
} as AppConfigContextType;

const BUTTON_TEXT = 'Digital submission';

describe('DigitalSubmissionButton', () => {
  const defaultSubmission = { data: {} };
  const defaultTranslations = {};

  const renderButton = (props: Partial<Props> = {}, appConfigProps: Partial<AppConfigContextType> = {}) => {
    const defaultProps: Props = {
      submission: defaultSubmission,
      onError: vi.fn(),
      ...props,
    } as Props;
    render(
      <AppConfigProvider {...defaultAppConfigProps} {...appConfigProps}>
        <MemoryRouter>
          <FormProvider form={{ components: [] } as unknown as NavFormType}>
            <SendInnProvider>
              <LanguagesProvider translations={defaultTranslations}>
                <DigitalSubmissionButton {...defaultProps}>{BUTTON_TEXT}</DigitalSubmissionButton>
              </LanguagesProvider>
            </SendInnProvider>
          </FormProvider>
        </MemoryRouter>
      </AppConfigProvider>,
    );
  };

  it('renders button', () => {
    renderButton();
    expect(screen.getByRole('button', { name: BUTTON_TEXT })).toBeInTheDocument();
  });

  describe('backend endpoint', () => {
    let onError;
    let windowLocation;
    const baseUrl = 'http://baseUrl.fyllut.no';

    beforeEach(() => {
      windowLocation = { href: baseUrl, assign: vi.fn() };
      Object.defineProperty(window, 'location', {
        value: windowLocation,
        writable: true,
      });
      onError = vi.fn();
    });

    afterEach(() => {
      nock.isDone();
      // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
      window.location = originalWindowLocation;
    });

    it('calls onError when submission is undefined', async () => {
      renderButton({ onError, submission: undefined });
      const button = screen.getByRole('button', { name: BUTTON_TEXT });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(windowLocation.href).toEqual(baseUrl);
    });

    it('redirects when backend returns 201 and Location header', async () => {
      nock(BASE_URL).put('/api/send-inn/utfyltsoknad').reply(201, 'CREATED', { Location: SEND_INN_URL });
      renderButton({ onError });
      const button = screen.getByRole('button', { name: BUTTON_TEXT });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      expect(onError).toHaveBeenCalledTimes(0);
      await waitFor(() => expect(windowLocation.href).toEqual(SEND_INN_URL));
    });

    it("responds with error when clicked in application 'bygger'", async () => {
      nock(BASE_URL).put('/api/send-inn/utfyltsoknad').reply(201, 'CREATED', { Location: SEND_INN_URL });
      renderButton({ onError }, { app: 'bygger' });
      const button = screen.getByRole('button', { name: BUTTON_TEXT });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(onError.mock.calls[0][0].message).toBe(
        'Digital innsending er ikke støttet ved forhåndsvisning i byggeren.',
      );
      expect(windowLocation.href).toEqual(baseUrl);
    });
  });
});
