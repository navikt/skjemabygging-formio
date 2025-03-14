import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PrepareIngenInnsendingPage } from './PrepareIngenInnsendingPage';

vi.mock('../../context/languages', () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

describe('PrepareIngenInnsendingPage', () => {
  let submitCalls: React.SyntheticEvent<HTMLFormElement>[] = [];

  const submitEventListener = (event) => {
    event.preventDefault();
    submitCalls.push(event);
  };

  beforeAll(() => {
    window.addEventListener('submit', submitEventListener);
  });

  afterAll(() => {
    window.removeEventListener('submit', submitEventListener);
  });

  const testForm = {
    title: 'Mitt testskjema',
    path: 'testskjema',
    tags: ['nav-skjema'],
    name: 'testskjema',
    type: 'OPP',
    display: 'wizard',
    properties: {
      skjemanummer: '',
      innsending: 'INGEN',
      innsendingOverskrift: 'Skriv ut skjemaet',
      innsendingForklaring: 'Gi det til pasienten',
    },
    components: [],
  };

  beforeEach(() => {
    submitCalls = [];
    render(
      <MemoryRouter initialEntries={[`/forms/${testForm.path}/ingen-innsending`]}>
        <PrepareIngenInnsendingPage
          form={testForm}
          submission={{} as Submission}
          formUrl="/testskjema"
          translations={{}}
        />
      </MemoryRouter>,
    );
  });

  test('Rendring av oppgitt overskrift og forklaring ved ingen innsending', () => {
    expect(screen.queryByRole('heading', { name: testForm.properties.innsendingOverskrift })).toBeTruthy();
    expect(screen.queryByText(testForm.properties.innsendingForklaring)).toBeTruthy();
  });

  test('Nedlasting av pdf', async () => {
    const lastNedSoknadKnapp = screen.getByRole('button', { name: TEXTS.grensesnitt.downloadApplication });
    await userEvent.click(lastNedSoknadKnapp);
    expect(submitCalls).toHaveLength(1);

    const form = submitCalls[0].target as HTMLFormElement;

    const formInput = form.elements[0] as HTMLInputElement;
    expect(formInput.name).toBe('form');
    const formInputValueJson = JSON.parse(formInput.value);
    expect(formInputValueJson.title).toEqual(testForm.title);

    const submissionInput = form.elements[1] as HTMLInputElement;
    expect(submissionInput.name).toBe('submission');
  });
});
