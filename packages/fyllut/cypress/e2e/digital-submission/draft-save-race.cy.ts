import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const draftId = '7ba1edc9-8635-47ac-864b-4d9033bb28c9';
const draftUrl = `/fyllut/api/send-inn/soknad/${draftId}`;
const answersUrl = `/fyllut/draftsaverace/answers?sub=digital&innsendingsId=${draftId}`;

const draftResponse = (submission: Submission) => ({
  innsendingsId: draftId,
  hoveddokumentVariant: { document: { data: submission, language: 'nb' } },
  endretDato: '2026-09-29T12:00:00.000Z',
  skalSlettesDato: '2026-10-27T12:00:00.000Z',
});

const deferred = () => {
  let resolve!: () => void;
  const promise = new Cypress.Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('Edits during draft saving', () => {
  let storedSubmission: Submission;

  const interceptSaves = (
    first: ReturnType<typeof deferred>,
    { next = first, failOn }: { next?: ReturnType<typeof deferred>; failOn?: number } = {},
  ) => {
    const requests: Submission[] = [];
    cy.intercept('PUT', '/fyllut/api/send-inn/soknad', (request) => {
      requests.push(request.body.submission);
      if (requests.length === failOn) {
        request.reply({ statusCode: 500, body: { message: 'Save failed' } });
        return;
      }
      return (requests.length === 1 ? first.promise : next.promise).then(() => {
        storedSubmission = request.body.submission;
        request.reply(draftResponse(storedSubmission));
      });
    }).as('saveDraft');
    return requests;
  };

  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    storedSubmission = { data: { answer: 'Initial answer' }, selfDeclaration: true };
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
    cy.intercept('GET', draftUrl, (request) => request.reply(draftResponse(storedSubmission))).as('loadDraft');
    cy.visit(answersUrl);
    cy.defaultWaits();
    cy.wait('@loadDraft');
    cy.findByRole('textbox', { name: 'Answer' }).should('have.value', 'Initial answer');
  });

  it('waits for the latest edit, uses the latest panel order and restores the saved answer on resume', () => {
    const first = deferred();
    const second = deferred();
    const requests = interceptSaves(first, { next: second });

    cy.clickSaveAndContinue();
    cy.wrap(requests).should('have.length', 1);
    cy.findByRole('textbox', { name: 'Answer' }).clear();
    cy.findByRole('textbox', { name: 'Answer' }).type('Latest answer');
    cy.findByRole('checkbox', { name: /^Show extra page/ }).check();
    cy.then(() => first.resolve());
    cy.wait('@saveDraft');
    cy.wrap(requests).should('have.length', 2);
    cy.findByRole('heading', { name: 'Answers', level: 2 }).should('be.visible');
    cy.then(() => second.resolve());
    cy.wait('@saveDraft').its('request.body.submission.data').should('deep.include', {
      answer: 'Latest answer',
      extraPage: true,
    });
    cy.findByRole('heading', { name: 'Extra page', level: 2 }).should('be.visible');
    cy.wrap(requests).should('have.length', 2);

    cy.visit(answersUrl);
    cy.defaultWaits();
    cy.wait('@loadDraft');
    cy.findByRole('textbox', { name: 'Answer' }).should('have.value', 'Latest answer');
    cy.findByRole('checkbox', { name: /^Show extra page/ }).should('be.checked');
  });

  it('keeps the latest answer on the page when a follow-up save fails and allows retry', () => {
    const first = deferred();
    const requests = interceptSaves(first, { failOn: 2 });

    cy.clickSaveAndContinue();
    cy.wrap(requests).should('have.length', 1);
    cy.findByRole('textbox', { name: 'Answer' }).clear();
    cy.findByRole('textbox', { name: 'Answer' }).type('Keep this answer');
    cy.then(() => first.resolve());
    cy.wait('@saveDraft');
    cy.wait('@saveDraft').its('response.statusCode').should('equal', 500);
    cy.findByText(TEXTS.statiske.mellomlagringError.update.message).should('be.visible');
    cy.findByRole('heading', { name: 'Answers', level: 2 }).should('be.visible');
    cy.findByRole('textbox', { name: 'Answer' }).should('have.value', 'Keep this answer');

    cy.clickSaveAndContinue();
    cy.wait('@saveDraft').its('request.body.submission.data.answer').should('equal', 'Keep this answer');
    cy.findByRole('heading', { name: 'Next page', level: 2 }).should('be.visible');
    cy.wrap(requests).should('have.length', 3);
  });

  it('revalidates an answer cleared during saving before navigating', () => {
    const first = deferred();
    const requests = interceptSaves(first);

    cy.clickSaveAndContinue();
    cy.wrap(requests).should('have.length', 1);
    cy.findByRole('textbox', { name: 'Answer' }).clear();
    cy.then(() => first.resolve());
    cy.wait('@saveDraft');
    cy.wait('@saveDraft').its('request.body.submission.data.answer').should('equal', '');
    cy.findByRole('heading', { name: 'Answers', level: 2 }).should('be.visible');
    cy.findByRole('link', { name: 'Du må fylle ut: Answer' }).should('be.visible');
    cy.findByRole('textbox', { name: 'Answer' }).should('have.value', '');

    cy.findByRole('textbox', { name: 'Answer' }).type('Valid again');
    cy.clickSaveAndContinue();
    cy.wait('@saveDraft').its('request.body.submission.data.answer').should('equal', 'Valid again');
    cy.findByRole('heading', { name: 'Next page', level: 2 }).should('be.visible');
  });

  it('does not navigate back from the summary when an earlier page finishes saving', () => {
    const first = deferred();
    const requests = interceptSaves(first);

    cy.clickSaveAndContinue();
    cy.wrap(requests).should('have.length', 1);
    cy.clickShowAllSteps();
    cy.findByRole('link', { name: 'Oppsummering' }).click();
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');
    cy.then(() => first.resolve());
    cy.wait('@saveDraft');
    cy.findByRole('heading', { name: 'Oppsummering', level: 2 }).should('be.visible');
  });

  it('requires the self-declaration if it is unchecked while the introduction is saving', () => {
    const first = deferred();
    const requests = interceptSaves(first);
    cy.visit(`/fyllut/draftsaverace?sub=digital&innsendingsId=${draftId}`);
    cy.defaultWaits();
    cy.wait('@loadDraft');
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).should('be.checked');

    cy.clickStart();
    cy.wrap(requests).should('have.length', 1);
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ }).uncheck();
    cy.then(() => first.resolve());
    cy.wait('@saveDraft');
    cy.wait('@saveDraft').its('request.body.submission.selfDeclaration').should('equal', false);
    cy.findByRole('checkbox', { name: /Jeg bekrefter at jeg vil svare så riktig som jeg kan/ })
      .should('not.be.checked')
      .and('have.attr', 'aria-invalid', 'true');

    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.wait('@saveDraft').its('request.body.submission.selfDeclaration').should('equal', true);
    cy.findByRole('heading', { name: 'Answers', level: 2 }).should('be.visible');
  });
});
