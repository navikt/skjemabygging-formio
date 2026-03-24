/*
 * Production form tests for Søknad om særbidrag
 * Form: nav540013
 * Submission types: PAPER, DIGITAL, DIGITAL_NO_LOGIN
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 observable customConditionals
 *       identitet.harDuFodselsnummer → adresse / folkeregister alert
 *   - Om den andre parten (omDenAndreParten): 5 customConditionals
 *       harMotpartenNorskFodselsnummerEllerDNummer → vetDuFodselsdatoenTilDenAndreParten
 *       borMotpartenINorge + vetDuAdressen → norsk adresse / utenlandsk adresse / landvelger
 *   - Din inntekt (dinInntekt): 1 customConditional
 *       harDuSkattepliktigInntektINorge → harAnnenInntekt container
 *   - Vedlegg (vedlegg): 2 cross-panel customConditionals
 *       detDuSokerOmForHvertAvBarna.hvaSokerDuSaerbidragForTilDetteBarnet → dokumentasjonPaUtgifteneTilKonfirmasjon
 *       opplysningerOmBarn.harNavMottattAvtalenOmDeltFastBostedForDetteBarnetIDenneSaken → kopiAvAvtaleOmDeltFastBosted
 */

const formPath = 'nav540013';
const submissionMethod = '?sub=paper';

const visitPath = (path = '') => {
  cy.visit(`/fyllut/${formPath}${path}${submissionMethod}`);
  cy.defaultWaits();
};

const answerRadio = (label: string | RegExp, value: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: value }).click();
  });
};

const fillApplicantWithFnr = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
  cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
};

const fillChildMinimal = ({ sharedResidence = 'Nei' }: { sharedResidence?: 'Ja' | 'Nei' } = {}) => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('textbox', { name: 'Barnets etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /Barnets fødselsdato/ }).type('15.01.2015');
  answerRadio('Bor barnet i Norge?', 'Ja');
  answerRadio('Bor barnet fast hos deg?', 'Ja');
  answerRadio('Har barnet delt fast bosted?', sharedResidence);

  if (sharedResidence === 'Ja') {
    cy.findByLabelText('Hvor mange netter er barnet hos den andre forelderen per måned?').type('7');
    answerRadio('Har Nav mottatt avtalen om delt fast bosted for dette barnet i denne saken?', 'Nei');
  }
};

const fillSaerbidragKonfirmasjon = () => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('group', { name: /Hva søker du særbidrag for til dette barnet/ }).within(() => {
    cy.findByRole('checkbox', { name: 'Konfirmasjon' }).check();
  });
  cy.findByLabelText('Beløp for utgift til konfirmasjon').type('1000');
  answerRadio('Har du oppgitt beløpet for konfirmasjon i norske kroner?', 'Ja');
  answerRadio('Har du og den andre parten hatt en avtale om å dele på utgiftene til konfirmasjonen?', 'Nei');
  answerRadio(
    'Ønsker du at Skatteetaten skal kreve inn særbidraget for dette barnet?',
    'Nei, vi gjør opp privat oss i mellom',
  );
};

const fillOtherPartyMinimal = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Per');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Motpart');
  answerRadio(
    'Kjenner du den andre partens norske fødselsnummer eller d-nummer?',
    'Den andre parten har ikke norsk fødselsnummer eller d-nummer',
  );
  answerRadio('Vet du fødselsdatoen til den andre parten?', 'Ja');
  cy.findByRole('textbox', { name: /Den andre partens fødselsdato/ }).type('01.01.1990');
  answerRadio('Bor den andre parten i Norge?', 'Ja');
  answerRadio('Vet du adressen?', 'Nei');
};

describe('nav540013', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    it('shows address fields without a Norwegian identity number and shows the folkeregister alert with one', () => {
      visitPath('/dineOpplysninger');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
      cy.findByText(/Nav sender svar på søknad/).should('exist');
    });
  });

  describe('Om den andre parten conditionals', () => {
    it('switches between birth-date, Norwegian address, foreign address, and country lookup branches', () => {
      visitPath('/omDenAndreParten');
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('not.exist');

      answerRadio(
        'Kjenner du den andre partens norske fødselsnummer eller d-nummer?',
        'Den andre parten har ikke norsk fødselsnummer eller d-nummer',
      );
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('exist');
      cy.findByRole('textbox', { name: /Den andre partens fødselsnummer eller d-nummer/i }).should('not.exist');

      answerRadio('Vet du fødselsdatoen til den andre parten?', 'Ja');
      cy.findByRole('textbox', { name: /Den andre partens fødselsdato/ }).should('exist');

      answerRadio('Bor den andre parten i Norge?', 'Ja');
      answerRadio('Vet du adressen?', 'Ja');
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('exist');

      answerRadio('Bor den andre parten i Norge?', 'Nei');
      cy.findByRole('textbox', { name: /Vegadresse/ }).should('not.exist');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('exist');

      answerRadio('Vet du adressen?', 'Nei');
      cy.findByRole('textbox', { name: /Vegnavn og husnummer, eller postboks/ }).should('not.exist');
      cy.findByRole('combobox', { name: /Hvilket land bor den andre parten i|Velg land/ }).should('exist');

      answerRadio('Kjenner du den andre partens norske fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /Den andre partens fødselsnummer eller d-nummer/i }).should('exist');
      cy.findByLabelText('Vet du fødselsdatoen til den andre parten?').should('not.exist');
      cy.findByLabelText('Bor den andre parten på sin folkeregistrerte adresse?').should('exist');
    });
  });

  describe('Din inntekt conditionals', () => {
    it('shows the foreign-income branch and hides self-employment follow-ups when the applicant has no taxable income', () => {
      visitPath('/dinInntekt');
      cy.findByLabelText('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?').should(
        'not.exist',
      );

      answerRadio('Har du skattepliktig inntekt i Norge?', /Nei, jeg har ikke skattepliktig inntekt/);
      cy.findByRole('textbox', {
        name: 'Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt',
      }).should('exist');
      cy.findByLabelText('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?').should(
        'not.exist',
      );

      answerRadio('Har du skattepliktig inntekt i Norge?', 'Nei, men jeg har inntekt utenfor Norge');
      cy.findByLabelText('Samlet brutto personinntekt per år').should('exist');
      cy.findByLabelText('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?').should(
        'exist',
      );

      answerRadio('Har du oppgitt beløpet i norske kroner?', 'Nei');
      cy.findByLabelText('Velg hvilken valuta du har oppgitt beløpet i').should('exist');

      answerRadio('Har du skattepliktig inntekt i Norge?', /Nei, jeg har ikke skattepliktig inntekt/);
      cy.findByLabelText('Samlet brutto personinntekt per år').should('not.exist');
      cy.findByLabelText('Har du skattepliktig inntekt som selvstendig næringsdrivende eller frilanser?').should(
        'not.exist',
      );
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the konfirmasjon attachment only after konfirmasjon is selected on Om særbidraget', () => {
      visitPath('/omSaerbidraget');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på utgiftene til konfirmasjon/ }).should('not.exist');

      cy.findByRole('link', { name: 'Om særbidraget' }).click();
      fillSaerbidragKonfirmasjon();
      cy.clickNextStep();

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på utgiftene til konfirmasjon/ }).should('exist');
    });

    it('shows the delt fast bosted attachment only after the child row says Nav has not received the agreement', () => {
      visitPath('/omBarnet');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av avtale om delt fast bosted/ }).should('not.exist');

      cy.findByRole('link', { name: 'Om barnet' }).click();
      fillChildMinimal({ sharedResidence: 'Ja' });

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Kopi av avtale om delt fast bosted/ }).should('exist');
    });
  });

  describe('Summary', () => {
    it('fills the minimum required answers and verifies the summary', () => {
      visitPath('/veiledning');
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillApplicantWithFnr();
      cy.clickNextStep();

      fillChildMinimal();
      cy.clickNextStep();

      fillSaerbidragKonfirmasjon();
      cy.clickNextStep();

      fillOtherPartyMinimal();
      cy.clickNextStep();

      answerRadio('Er du i jobb?', 'Ja');
      cy.findByRole('group', { name: /Kryss av for det som gjelder for deg/ }).within(() => {
        cy.findByRole('checkbox', { name: 'Ansatt' }).check();
      });
      cy.clickNextStep();

      answerRadio('Har du skattepliktig inntekt i Norge?', /Nei, jeg har ikke skattepliktig inntekt/);
      cy.findByRole('textbox', {
        name: 'Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt',
      }).type('Jeg har ingen skattepliktig inntekt akkurat nå.');
      cy.clickNextStep();

      cy.findByRole('group', { name: /Dokumentasjon på utgiftene til konfirmasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).click();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om barnet', () => {
        cy.contains('dt', 'Barnets fornavn').next('dd').should('contain.text', 'Sara');
      });
      cy.withinSummaryGroup('Om den andre parten', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Per');
      });
    });
  });
});
