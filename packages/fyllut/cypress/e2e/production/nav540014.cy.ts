/*
 * Production form tests for Svar i sak om særbidrag
 * Form: nav540014
 * Submission types: PAPER, DIGITAL
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 2 observable customConditionals
 *       identitet.harDuFodselsnummer -> adresse / folkeregister alert
 *   - Boforhold og andre egne barn (boforholdOgAndreEgneBarn): relevant custom count branches
 *       hvorMangeAndreEgneBarnUnder18ArBorFastHosDeg -> harNoenAvDisseBarnaAvtaleOmDeltFastBosted
 *       harNoenAvDisseBarnaAvtaleOmDeltFastBosted -> count field for 2 children
 *   - Om særbidraget (omSarbidraget): relevant row-scoped customConditionals
 *       harDuOgDenAndrePartenAvtaltADelePaUtgifteneTilAnnet -> avtale textarea / payment radiopanel
 *       harDuBetaltSaerbidragetTilAnnetEtterAvtalen -> paid amount textarea
 *   - Din inntekt (dinInntekt): 1 customConditional
 *       harDuSkattepliktigInntektINorge -> harAnnenInntekt container
 *   - Vedlegg (vedlegg): 2 cross-panel attachment conditionals
 *       omSaerbidraget.konfirmasjon -> dokumentasjonPaDetDuHarBetaltForKonfirmasjon
 *       boforholdOgAndreEgneBarn shared-residence answers -> avtaleOmDeltFastBostedForAndreEgneBarn
 */

const formPath = 'nav540014';

const visitPath = (path = '') => {
  cy.visit(`/fyllut/${formPath}${path}?sub=paper`);
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
    answerRadio('Har Nav mottatt avtalen om delt fast bosted for dette barnet?', 'Nei');
  }
};

const fillBoforholdMinimal = () => {
  answerRadio('Bor du sammen med voksne over 18 år?', 'Nei');
  answerRadio('Har du andre egne barn under 18 år som bor fast hos deg?', 'Nei');
  answerRadio('Betaler du barnebidrag for andre egne barn?', 'Nei');
};

const fillSaerbidragAnnetMinimal = () => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('group', { name: 'Hva er det søkt særbidrag for?' }).within(() => {
    cy.findByRole('checkbox', { name: 'Annet' }).check();
  });
  cy.findByRole('textbox', { name: 'Oppgi hvilke andre utgifter det er søkt særbidrag for' }).type('Skoleutstyr');
  answerRadio("Har du og den andre parten avtalt å dele på utgiftene til 'annet'?", 'Nei');
};

const fillSaerbidragKonfirmasjonWithPayment = () => {
  cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
  cy.findByRole('group', { name: 'Hva er det søkt særbidrag for?' }).within(() => {
    cy.findByRole('checkbox', { name: 'Konfirmasjon' }).check();
  });
  answerRadio('Har du og den andre parten avtalt å dele på utgiftene til konfirmasjonen?', 'Ja');
  cy.findByRole('textbox', { name: 'Oppgi hva du og den andre parten har avtalt om konfirmasjonen' }).type(
    'Vi skulle dele utgiftene likt.',
  );
  answerRadio('Har du betalt særbidraget til konfirmasjonen etter avtalen?', 'Jeg har betalt noe');
};

const goToOmSaerbidraget = () => {
  visitPath('/veiledning');
  cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
  cy.clickNextStep();
  fillApplicantWithFnr();
  cy.clickNextStep();
  fillChildMinimal();
  cy.clickNextStep();
  fillBoforholdMinimal();
  cy.clickNextStep();
  cy.findByRole('heading', { level: 2, name: 'Om særbidraget' }).should('exist');
};

describe('nav540014', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    it('shows address fields only when the applicant lacks a Norwegian identity number', () => {
      visitPath('/dineOpplysninger');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Nei');
      cy.findByLabelText('Bor du i Norge?').should('exist');

      answerRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByLabelText('Bor du i Norge?').should('not.exist');
    });
  });

  describe('Boforhold og andre egne barn conditionals', () => {
    it('shows the shared-residence count question only for multiple under-18 children', () => {
      visitPath('/boforholdOgAndreEgneBarn');
      answerRadio('Bor du sammen med voksne over 18 år?', 'Nei');
      answerRadio('Har du andre egne barn under 18 år som bor fast hos deg?', 'Ja');

      cy.findByLabelText('Har noen av disse barna avtale om delt fast bosted?').should('not.exist');
      cy.findByLabelText('Hvor mange av disse barna har avtale om delt fast bosted?').should('not.exist');

      cy.findByLabelText('Hvor mange andre egne barn under 18 år bor fast hos deg?').type('2');
      cy.findByLabelText('Har noen av disse barna avtale om delt fast bosted?').should('exist');

      answerRadio('Har noen av disse barna avtale om delt fast bosted?', 'Ja');
      cy.findByLabelText('Hvor mange av disse barna har avtale om delt fast bosted?').should('exist');
      cy.findByLabelText('Hvor mange av disse barna har avtale om delt fast bosted?').type('1');

      answerRadio('Har noen av disse barna avtale om delt fast bosted?', 'Nei');
      cy.findByLabelText('Hvor mange av disse barna har avtale om delt fast bosted?').should('not.exist');
    });
  });

  describe('Om særbidraget conditionals', () => {
    it("shows 'annet' agreement and paid-amount fields only for the matching branch", () => {
      goToOmSaerbidraget();
      cy.findByRole('textbox', { name: 'Oppgi hva du og den andre parten har avtalt' }).should('not.exist');
      cy.findByLabelText("Har du betalt særbidraget til 'annet' etter avtalen?").should('not.exist');

      cy.findByRole('textbox', { name: 'Barnets fornavn' }).type('Sara');
      cy.findByRole('group', { name: 'Hva er det søkt særbidrag for?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).check();
      });

      cy.findByRole('textbox', { name: 'Oppgi hvilke andre utgifter det er søkt særbidrag for' }).type('Skoleutstyr');
      answerRadio("Har du og den andre parten avtalt å dele på utgiftene til 'annet'?", 'Ja');
      cy.findByRole('textbox', { name: 'Oppgi hva du og den andre parten har avtalt' }).should('exist');
      cy.findByLabelText("Har du betalt særbidraget til 'annet' etter avtalen?").should('exist');

      cy.findByRole('textbox', { name: 'Oppgi hva du og den andre parten har avtalt' }).type('Vi delte kostnaden.');
      answerRadio("Har du betalt særbidraget til 'annet' etter avtalen?", 'Jeg har betalt noe');
      cy.findByRole('textbox', {
        name: 'Oppgi beløpet du har betalt, og spesifiser hva betalingen gjelder for',
      }).should('exist');

      cy.findByRole('group', { name: 'Hva er det søkt særbidrag for?' }).within(() => {
        cy.findByRole('checkbox', { name: 'Annet' }).uncheck();
      });
      cy.findByRole('textbox', { name: 'Oppgi hva du og den andre parten har avtalt' }).should('not.exist');
      cy.findByRole('textbox', {
        name: 'Oppgi beløpet du har betalt, og spesifiser hva betalingen gjelder for',
      }).should('not.exist');
    });
  });

  describe('Din inntekt conditionals', () => {
    it('shows other-income follow-ups only for taxable or foreign-income branches', () => {
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
    });
  });

  describe('Vedlegg conditionals', () => {
    it('shows the konfirmasjon attachment only after the payment branch is selected on Om særbidraget', () => {
      goToOmSaerbidraget();
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på det du har betalt for konfirmasjon/ }).should('not.exist');

      cy.findByRole('link', { name: 'Om særbidraget' }).click();
      fillSaerbidragKonfirmasjonWithPayment();

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Dokumentasjon på det du har betalt for konfirmasjon/ }).should('exist');
    });

    it('shows the shared-residence attachment for other children only after the relevant answers are set', () => {
      visitPath('/boforholdOgAndreEgneBarn');
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Avtale om delt fast bosted for andre egne barn/ }).should('not.exist');

      cy.findByRole('link', { name: 'Boforhold og andre egne barn' }).click();
      answerRadio('Bor du sammen med voksne over 18 år?', 'Nei');
      answerRadio('Har du andre egne barn under 18 år som bor fast hos deg?', 'Ja');
      cy.findByLabelText('Hvor mange andre egne barn under 18 år bor fast hos deg?').type('2');
      answerRadio('Har noen av disse barna avtale om delt fast bosted?', 'Ja');
      cy.findByLabelText('Hvor mange av disse barna har avtale om delt fast bosted?').type('1');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Avtale om delt fast bosted for andre egne barn/ }).should('exist');
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

      fillBoforholdMinimal();
      cy.clickNextStep();

      fillSaerbidragAnnetMinimal();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Kari');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Søker');
      cy.clickNextStep();

      answerRadio('Er du i jobb?', 'Nei');
      cy.findByRole('textbox', { name: 'Beskriv hva som er grunnen til at du ikke er i jobb' }).type(
        'Jeg er mellom jobber.',
      );
      cy.clickNextStep();

      answerRadio('Har du skattepliktig inntekt i Norge?', /Nei, jeg har ikke skattepliktig inntekt/);
      cy.findByRole('textbox', {
        name: 'Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt',
      }).type('Jeg har ingen skattepliktig inntekt akkurat nå.');
      cy.clickNextStep();

      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Dine opplysninger', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Ola');
      });
      cy.withinSummaryGroup('Om barnet', () => {
        cy.contains('dt', 'Barnets fornavn').next('dd').should('contain.text', 'Sara');
      });
      cy.withinSummaryGroup('Om den som har søkt', () => {
        cy.contains('dt', 'Fornavn').next('dd').should('contain.text', 'Kari');
      });
    });
  });
});
