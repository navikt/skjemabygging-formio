import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { defaultFormWithAttachment } from '../../../../test/test-data/form/data';
import { Buttons, formWithProperties, getButtons } from '../../../../test/util/helpers';
import { AppConfigContextType, AppConfigProvider } from '../../../context/config/configContext';
import { SendInnProvider } from '../../../context/sendInn/sendInnContext';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import SummaryPageNavigation, { Props } from './SummaryPageNavigation';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  const params = new URLSearchParams();
  params.set('innsendingsId', '6895e72c-bd59-4964-a098-822c4a83799c');
  params.set('lang', 'nb');
  return {
    ...actual,
    useRouteMatch: () => ({ url: '/forms/previous' }),
    useSearchParams: vi.fn().mockReturnValue([params, vi.fn()]),
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
    formUrl: '/testform',
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
        path: '/testform/*',
        element: (
          <SendInnProvider
            form={(props.form ?? {}) as NavFormType}
            formUrl="/fyllut/testform"
            translations={{}}
            updateSubmission={vi.fn()}
            onFyllutStateChange={vi.fn()}
          >
            <SummaryPageNavigation {...summaryPageProps} />
            <div id="formio-summary-hidden" hidden />
          </SendInnProvider>
        ),
      },
    ],
    {
      initialEntries: ['/testform'],
    },
  );

  render(
    <AppConfigProvider {...appConfigProps}>
      <RouterProvider router={router} />
    </AppConfigProvider>,
  );

  await screen.getByRole('navigation');
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
    it('når skjeamets innsendingstype er undefined, rendres knapp for å gå videre til send-i-posten', async () => {
      const form = formWithProperties({ innsending: undefined });
      const { router, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: 'paper' });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });

    it('når skjemaets innsendingstype er PAPIR_OG_DIGITAL, rendres knapp for å gå videre til send-i-posten', async () => {
      const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
      const { router, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: 'paper' });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });
  });

  describe("Forhåndvisning i 'bygger' bruker papir-løpet uansett innsending", () => {
    it('innsending=PAPIR_OG_DIGITAL, submissionMethod=paper', async () => {
      const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
      const appConfigProps = { submissionMethod: 'paper', app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });

    it('innsending=PAPIR_OG_DIGITAL, submissionMethod=digital', async () => {
      const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
      const appConfigProps = { submissionMethod: 'digital', app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });

    it('innsending=KUN_DIGITAL - rendrer knapp for direkte innsending til NAV', async () => {
      const form = formWithProperties({ innsending: 'KUN_DIGITAL' });
      const appConfigProps = { app: 'bygger' } as AppConfigContextType;
      const { buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
    });

    it('innsending=KUN_PAPIR', async () => {
      const form = formWithProperties({ innsending: 'KUN_PAPIR' });
      const appConfigProps = { app: 'bygger' } as AppConfigContextType;
      const { router, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });
  });

  describe('Form med kun papir-innsending', () => {
    it('Rendrer form med innsending=KUN_PAPIR', async () => {
      const form = formWithProperties({ innsending: 'KUN_PAPIR' });
      const { buttons, router } = await renderSummaryPageNavigation({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });
  });

  describe('Form med kun digital innsending', () => {
    it('sender skjema med vedlegg til send-inn', async () => {
      const basePath = 'https://www.unittest.nav.no/fyllut';
      const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
      const windowLocation = { href: basePath };
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
      const form = formWithProperties({ innsending: 'KUN_DIGITAL' }, defaultFormWithAttachment);
      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      await userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe('https://www.unittest.nav.no/send-inn/123'));
      nock.isDone();

      window.location = originalWindowLocation;
    });

    it('ber om bekreftelse før den kaller send-inn når skjemaet er uten vedlegg', async () => {
      const basePath = 'https://www.unittest.nav.no/fyllut';
      const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
      const windowLocation = { href: basePath };
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
      const form = formWithProperties({ innsending: 'KUN_DIGITAL' });
      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);

      await userEvent.click(buttons.sendTilNavKnapp);
      await userEvent.click(screen.getByRole('button', { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));
      await waitFor(() => expect(windowLocation.href).toBe('https://www.unittest.nav.no/send-inn/123'));
      nock.isDone();

      window.location = originalWindowLocation;
    });
  });

  describe('Form med ingen innsending', () => {
    it('Rendrer form med innsending=INGEN', async () => {
      const form = formWithProperties({ innsending: 'INGEN' });
      const { router, buttons } = await renderSummaryPageNavigation({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/ingen-innsending');
    });
  });

  describe('Submission method', () => {
    describe('method=digital', () => {
      it('renders next-button when no validation errors', async () => {
        const basePath = 'https://www.unittest.nav.no/fyllut';
        const sendInnUrl = 'https://www.unittest.nav.no/sendInn';
        const windowLocation = { href: basePath };
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
        const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
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

        window.location = originalWindowLocation;
      });

      it('hides next-button if validation of soknad is not complete', async () => {
        const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
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
        const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
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
      const form = formWithProperties({ innsending: 'PAPIR_OG_DIGITAL' });
      const { router, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: 'paper' });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });
  });
});
