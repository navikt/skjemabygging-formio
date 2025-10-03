import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { MemoryRouter } from 'react-router';
import { AppConfigProvider } from '../../context/config/configContext';
import { FormProvider } from '../../context/form/FormContext';
import { PrepareIngenInnsendingPage } from './PrepareIngenInnsendingPage';

vi.mock('../../context/languages', () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

const fyllutBaseURL = 'http://www.unittest.nav.no/fyllut';

describe('PrepareIngenInnsendingPage', () => {
  const testForm = {
    title: 'Mitt testskjema',
    path: 'testskjema',
    tags: ['nav-skjema'],
    name: 'testskjema',
    type: 'OPP',
    display: 'wizard',
    properties: {
      skjemanummer: '',
      tema: '',
      submissionTypes: [],
      subsequentSubmissionTypes: [],
      innsendingOverskrift: 'Skriv ut skjemaet',
      innsendingForklaring: 'Gi det til pasienten',
    },
    components: [],
  } as NavFormType;

  beforeEach(() => {
    const config = {
      fyllutBaseURL,
    };

    render(
      <AppConfigProvider {...config}>
        <MemoryRouter initialEntries={[`/forms/${testForm.path}/ingen-innsending`]}>
          <FormProvider form={testForm}>
            <PrepareIngenInnsendingPage />
          </FormProvider>
        </MemoryRouter>
        ,
      </AppConfigProvider>,
    );
  });

  test('Rendring av oppgitt overskrift og forklaring ved ingen innsending', () => {
    expect(screen.queryByRole('heading', { name: testForm.properties.innsendingOverskrift })).toBeTruthy();
    expect(screen.queryByText(testForm.properties.innsendingForklaring!)).toBeTruthy();
  });

  test('Nedlasting av pdf', async () => {
    const scope = nock(fyllutBaseURL).post('/api/documents/application').reply(200);

    const lastNedSoknadKnapp = screen.getByRole('button', { name: TEXTS.grensesnitt.downloadApplication });
    await userEvent.click(lastNedSoknadKnapp);

    expect(scope.isDone()).toBe(true);
  });
});
