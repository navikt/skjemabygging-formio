import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { defaultFormWithAttachment } from '../../../../test/test-data/form/data';
import { Buttons, formWithProperties, getButtons } from '../../../../test/util/helpers';
import { AppConfigContextType, AppConfigProvider } from '../../../context/config/configContext';
import { FormProvider } from '../../../context/form/FormContext';
import { SendInnProvider } from '../../../context/sendInn/sendInnContext';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import SummaryPageNavigation, { Props } from './SummaryPageNavigation';

vi.mock('react-router', async () => {
  const actual = await vi.importActual<object>('react-router');
  const params = new URLSearchParams();
  params.set('innsendingsId', '6895e72c-bd59-4964-a098-822c4a83799c');
  params.set('lang', 'nb');
  return {
    ...actual,
    useRouteMatch: () => ({ url: '/forms/previous' }),
    useSearchParams: vi.fn().mockReturnValue([params, vi.fn()]),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../context/languages', () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

const originalWindowLocation = window.location;
const isValid = vi.fn().mockReturnValue(true);
const onError = vi.fn();

const renderSummaryPageNavigation = async (
  props: Partial<Props>,
  appConfigProps: AppConfigContextType = {} as AppConfigContextType,
): Promise<{ router: any; buttons: Buttons }> => {
  const summaryPageProps: Props = {
    submission: { data: {} },
    panelValidationList: [],
    form: {} as NavFormType,
    isValid,
    onError,
    ...props,
  } as Props;

  const router = createMemoryRouter(
    [
      {
        path: '/testskjema/*',
        element: (
          <FormProvider form={(props.form ?? {}) as NavFormType}>
            <SendInnProvider>
              <SummaryPageNavigation {...summaryPageProps} />
              <div id="formio-summary-hidden" hidden />
            </SendInnProvider>
          </FormProvider>
        ),
      },
    ],
    {
      initialEntries: ['/testskjema'],
    },
  );

  render(
    <AppConfigProvider {...appConfigProps}>
      <RouterProvider router={router} />
    </AppConfigProvider>,
  );

  await waitFor(() => {
    screen.getByRole('navigation');
  });

  return { router, buttons: getButtons(screen) };
};

describe('SummaryPageNavigation', () => {
  const expectKnapperForRedigerSvarEllerGaVidere = (buttons: Buttons) => {
    const { redigerSvarKnapp, gaVidereKnapp } = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(gaVidereKnapp).toBeInTheDocument();
  };

  const expectKnapperForRedigerSvarEllerSendTilNav = (buttons: Buttons) => {
    const { redigerSvarKnapp, sendTilNavKnapp } = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(sendTilNavKnapp).toBeInTheDocument();
  };

  describe('Når valgt innsendingstype er papir', () => {
    it('når skjemaets submissionTypes type er PAPIR_OG_DIGITAL, rendres knapp for å gå videre til send-i-posten', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });
      const { router, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: 'paper' });

      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/send-i-posten');
    });
  });

  describe("Forhåndvisning i 'bygger' bruker papir-løpet uansett submissionTypes", () => {
    it('submissionTypes=PAPIR_OG_DIGITAL, submissionMethod=paper', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });
      const appConfigProps = { submissionMethod: 'paper', app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/send-i-posten');
    });

    it('submissionTypes=[PAPIR,DIGITAL], submissionMethod=digital', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });
      const appConfigProps = { submissionMethod: 'digital', app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/send-i-posten');
    });

    it('submissionTypes=DIGITAL - rendrer knapp for direkte submissionTypes til Nav', async () => {
      const form = formWithProperties({ submissionTypes: ['DIGITAL'] });
      const appConfigProps = { app: 'bygger' } as AppConfigContextType;

      const { buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
    });

    it('submissionTypes=PAPER', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER'] });
      const appConfigProps = { app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      await act(async () => {
        expectKnapperForRedigerSvarEllerGaVidere(buttons);
        await userEvent.click(buttons.gaVidereKnapp);
        expect(router.state.location.pathname).toBe('/send-i-posten');
      });
    });
  });

  describe('Form med kun papir-submissionTypes', () => {
    it('Rendrer form med submissionTypes=PAPER', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER'] });
      const { buttons, router } = await renderSummaryPageNavigation({ form });

      await act(async () => {
        expectKnapperForRedigerSvarEllerGaVidere(buttons);
        await userEvent.click(buttons.gaVidereKnapp);
        expect(router.state.location.pathname).toBe('/send-i-posten');
      });
    });
  });

  describe('Form med kun digital submissionTypes', () => {
    it('sender skjema med vedlegg til send-inn', async () => {
      const basePath = 'https://www.unittest.nav.no/fyllut';
      const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
      const windowLocation = { href: basePath, assign: vi.fn() };
      Object.defineProperty(window, 'location', {
        value: windowLocation,
        writable: true,
      });
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .put('/api/send-inn/utfyltsoknad')
        .reply(201, {}, { Location: 'https://www.unittest.nav.no/send-inn/123' });
      const form = formWithProperties({ submissionTypes: ['DIGITAL'] }, defaultFormWithAttachment);

      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe('https://www.unittest.nav.no/send-inn/123'));
      nock.isDone();

      // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
      window.location = originalWindowLocation;
    });

    it('ber om bekreftelse før den kaller send-inn når skjemaet er uten vedlegg', async () => {
      const basePath = 'https://www.unittest.nav.no/fyllut';
      const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
      const windowLocation = { href: basePath, assign: vi.fn() };
      Object.defineProperty(window, 'location', {
        value: windowLocation,
        writable: true,
      });
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .put('/api/send-inn/utfyltsoknad')
        .reply(201, {}, { Location: 'https://www.unittest.nav.no/send-inn/123' });
      const form = formWithProperties({ submissionTypes: ['DIGITAL'] });

      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);

      await userEvent.click(buttons.sendTilNavKnapp);
      await userEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));
      await waitFor(() => expect(windowLocation.href).toBe('https://www.unittest.nav.no/send-inn/123'));
      nock.isDone();

      // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
      window.location = originalWindowLocation;
    });
  });

  describe('Form med ingen submissionTypes', () => {
    it('Rendrer form med submissionTypes=INGEN', async () => {
      const form = formWithProperties({ submissionTypes: [] });

      const { router, buttons } = await renderSummaryPageNavigation({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testskjema/ingen-innsending');
    });
  });

  describe('Submission method', () => {
    describe('method=digital', () => {
      it('renders next-button when no validation errors', async () => {
        const basePath = 'https://www.unittest.nav.no/fyllut';
        const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
        const windowLocation = { href: basePath, assign: vi.fn() };
        Object.defineProperty(window, 'location', {
          value: windowLocation,
          writable: true,
        });
        nock(basePath)
          .defaultReplyHeaders({
            Location: sendInnUrl,
          })
          .put('/api/send-inn/utfyltsoknad')
          .reply(201, {}, { Location: 'https://www.unittest.nav.no/send-inn/123' });
        const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });

        const { buttons } = await renderSummaryPageNavigation(
          {
            form,
            panelValidationList: [],
          },
          {
            submissionMethod: 'digital',
            baseUrl: basePath,
          },
        );
        expectKnapperForRedigerSvarEllerSendTilNav(buttons);
        await userEvent.click(buttons.sendTilNavKnapp);
        await userEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));

        await waitFor(() => expect(windowLocation.href).toBe('https://www.unittest.nav.no/send-inn/123'));
        nock.isDone();

        // @ts-expect-error Possible bug in typescript: https://github.com/microsoft/TypeScript/issues/61335
        window.location = originalWindowLocation;
      });

      it('hides next-button if validation of soknad is not complete', async () => {
        const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });

        const { buttons } = await renderSummaryPageNavigation(
          {
            form,
            panelValidationList: undefined,
          },
          {
            submissionMethod: 'digital',
          },
        );
        expect(buttons.redigerSvarKnapp).toBeDefined();
        expect(buttons.sendTilNavKnapp).toBeNull();
        expect(buttons.gaVidereKnapp).toBeNull();
      });

      it('hides next-button if validation of soknad contains validation errors', async () => {
        const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });

        const { buttons } = await renderSummaryPageNavigation(
          {
            form,
            panelValidationList: [{ hasValidationErrors: true } as PanelValidation],
          },
          {
            submissionMethod: 'digital',
          },
        );
        expect(buttons.redigerSvarKnapp).toBeDefined();
        expect(buttons.sendTilNavKnapp).toBeNull();
        expect(buttons.gaVidereKnapp).toBeNull();
      });
    });

    it('renders next-button when method=paper', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'] });
      const { router, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: 'paper' });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/send-i-posten');
    });
  });
});
