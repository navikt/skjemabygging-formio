import { DeclarationType, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { Buttons, formWithProperties, getButtons } from '../../../test/util/helpers';
import { AppConfigContextType, AppConfigProvider } from '../../context/config/configContext';
import { SendInnProvider } from '../../context/sendInn/sendInnContext';
import { Props, SummaryPage } from './SummaryPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  return {
    ...actual,
    useRouteMatch: () => ({ url: '/forms/previous' }),
  };
});

vi.mock('../../context/languages', () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

const renderSummaryPage = async (
  props: Partial<Props>,
  appConfigProps: AppConfigContextType = {} as AppConfigContextType,
): Promise<{ router: any; buttons: Buttons }> => {
  const summaryPageProps: Props = {
    formUrl: '/testform',
    submission: {},
    form: {} as NavFormType,
    translations: {},
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
            <SummaryPage {...summaryPageProps} />
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
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole('heading', { level: 2, name: TEXTS.grensesnitt.title });
  return { router, buttons: getButtons(screen) };
};

describe('SummaryPage', () => {
  describe('ConfirmationPanel', () => {
    it('Ikke vis bekreftelse', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER', 'DIGITAL'], declarationType: DeclarationType.none });
      const { buttons, router } = await renderSummaryPage({ form }, { submissionMethod: 'paper' });
      const confirmCheckbox = screen.queryByRole('checkbox', { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).not.toBeInTheDocument();
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });

    it('Bekreft dataene dine', async () => {
      const form = formWithProperties({ submissionTypes: ['PAPER'], declarationType: DeclarationType.default });
      const { buttons, router } = await renderSummaryPage({ form }, { submissionMethod: 'paper' });
      const confirmCheckbox = screen.queryByRole('checkbox', { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).toBeInTheDocument();
      await userEvent.click(confirmCheckbox!);
      expect(confirmCheckbox).toBeChecked();
      await userEvent.click(buttons.gaVidereKnapp);
      expect(router.state.location.pathname).toBe('/testform/send-i-posten');
    });

    it('Ikke gå videre, uten å bekrefte dataene', async () => {
      const form = formWithProperties({
        submissionTypes: ['PAPER', 'DIGITAL'],
        declarationType: DeclarationType.default,
      });
      const { buttons, router } = await renderSummaryPage({ form }, { submissionMethod: 'paper' });
      const confirmCheckbox = screen.queryByRole('checkbox', { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).toBeInTheDocument();
      await userEvent.click(buttons.gaVidereKnapp);
      expect(confirmCheckbox).toHaveAttribute('aria-invalid', 'true');
      expect(confirmCheckbox).not.toBeChecked();
      expect(router.state.location.pathname).not.toBe('/testform/send-i-posten');
    });
  });
});
