/*
 * Production form tests for Refusjonskrav - opplæring
 * Form: nav761318
 * Submission types: none
 *
 * Panels tested:
 *   - Tiltaksarrangør (tiltaksarrangor): 2 same-panel conditionals
 *       erKontaktadressenEnVegadresseEllerPostboksadresse → norskVegadresse / norskPostboksadresse
 *   - Kurset (kurset): 5 same-panel conditionals
 *       kreverDuRefusjonForHeleTilsagnsbelopetNa → refusjonskrav1
 *       kreverDuRefusjonForHeleTilsagnsbelopetNa=nei → belopDuKreverRefundertNa, harDelerAvTilsagnsbelopetBlittRefundertTidligere
 *       harDelerAvTilsagnsbelopetBlittRefundertTidligere=ja → tidligereRefundertbelop, totaltBelop
 *       harDelerAvTilsagnsbelopetBlittRefundertTidligere=nei → hvorforKreverDereIkkeHeleTilsagnetUtbetaltNa
 */

const fillTiltaksarrangor = () => {
  cy.findByRole('textbox', { name: 'Navn på utdanningsinstitusjon eller kursarrangør' }).type('Test Kurs AS');
  cy.findByRole('textbox', { name: 'Hovedenhetens organisasjonsnummer' }).type('889640782');
  cy.findByRole('textbox', { name: 'Underenhetens organisasjonsnummer' }).type('974760673');
  cy.findByLabelText('Telefonnummer').type('12345678');
  cy.findByRole('textbox', { name: 'E-post' }).type('test@example.com');
  cy.findByRole('textbox', { name: /Kontonummer/ }).type('01234567892');
  cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
    cy.findByRole('radio', { name: 'Vegadresse' }).click();
  });
  cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1');
  cy.findByRole('textbox', { name: 'Postnummer' }).type('0151');
  cy.findByRole('textbox', { name: 'Poststed' }).type('Oslo');
};

const formatDate = (date: Date) => {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${day}.${month}.${date.getFullYear()}`;
};

const fillKurset = () => {
  const now = new Date();
  const fromDate = formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const toDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 0));

  cy.findByRole('textbox', { name: 'Vår referanse/tilsagnsnummer' }).type('REF-12345');
  cy.findByRole('textbox', { name: 'Kursets navn' }).type('Testkurs i tilrettelegging');
  cy.findByRole('textbox', { name: 'Fra og med dato (dd.mm.åååå)' }).type(fromDate);
  cy.findByRole('textbox', { name: 'Til og med dato (dd.mm.åååå)' }).type(toDate);
  cy.withinComponent('Gjelder refusjonskravet en enkeltplass eller et gruppetiltak?', () => {
    cy.findByRole('radio', { name: 'Enkeltplass' }).click();
  });
  cy.findByRole('textbox', { name: 'Avtalt pris' }).type('50000');
  cy.withinComponent('Krever du refusjon for hele tilsagnsbeløpet nå?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByRole('textbox', { name: 'Beløp du krever refundert nå' }).type('25000');
  cy.withinComponent('Har deler av tilsagnsbeløpet blitt refundert tidligere?', () => {
    cy.findByRole('radio', { name: 'Nei' }).click();
  });
  cy.findByRole('textbox', { name: 'Hvorfor krever dere ikke hele tilsagnet utbetalt nå?' }).type(
    'Vi sender resten i et senere krav.',
  );
};

const fillDeltakeren = () => {
  cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
  cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
  cy.findByRole('textbox', { name: /fødselsnummer eller d-nummer/i }).type('17912099997');
};

describe('nav761318', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.mocksRestoreRouteVariants();
    cy.defaultIntercepts();
  });

  describe('Tiltaksarrangør conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761318/tiltaksarrangor');
      cy.defaultWaits();
    });

    it('toggles address fields when address type changes', () => {
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Vegadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Vegadresse' }).should('exist');
      cy.findByRole('textbox', { name: 'Postboks' }).should('not.exist');

      cy.withinComponent('Er kontaktadressen en vegadresse eller postboksadresse?', () => {
        cy.findByRole('radio', { name: 'Postboksadresse' }).click();
      });

      cy.findByRole('textbox', { name: 'Postboks' }).should('exist');
      cy.findByRole('textbox', { name: 'Vegadresse' }).should('not.exist');
    });
  });

  describe('Kurset conditionals', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761318/kurset');
      cy.defaultWaits();
    });

    it('shows the full-refund field only when full refund is selected', () => {
      cy.findByRole('textbox', { name: 'Refusjonskrav' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Beløp du krever refundert nå' }).should('not.exist');
      cy.findByLabelText('Har deler av tilsagnsbeløpet blitt refundert tidligere?').should('not.exist');

      cy.withinComponent('Krever du refusjon for hele tilsagnsbeløpet nå?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Refusjonskrav' }).should('exist');
      cy.findByRole('textbox', { name: 'Beløp du krever refundert nå' }).should('not.exist');
      cy.findByLabelText('Har deler av tilsagnsbeløpet blitt refundert tidligere?').should('not.exist');
    });

    it('toggles partial-refund follow-up fields based on previous refunds', () => {
      cy.withinComponent('Krever du refusjon for hele tilsagnsbeløpet nå?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Beløp du krever refundert nå' }).should('exist');
      cy.findByLabelText('Har deler av tilsagnsbeløpet blitt refundert tidligere?').should('exist');
      cy.findByRole('textbox', { name: 'Tidligere refundert beløp' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Totalt beløp' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvorfor krever dere ikke hele tilsagnet utbetalt nå?' }).should('not.exist');

      cy.withinComponent('Har deler av tilsagnsbeløpet blitt refundert tidligere?', () => {
        cy.findByRole('radio', { name: 'Ja' }).click();
      });

      cy.findByRole('textbox', { name: 'Tidligere refundert beløp' }).should('exist');
      cy.findByRole('textbox', { name: 'Totalt beløp' }).should('exist');
      cy.findByRole('textbox', { name: 'Hvorfor krever dere ikke hele tilsagnet utbetalt nå?' }).should('not.exist');

      cy.withinComponent('Har deler av tilsagnsbeløpet blitt refundert tidligere?', () => {
        cy.findByRole('radio', { name: 'Nei' }).click();
      });

      cy.findByRole('textbox', { name: 'Tidligere refundert beløp' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Totalt beløp' }).should('not.exist');
      cy.findByRole('textbox', { name: 'Hvorfor krever dere ikke hele tilsagnet utbetalt nå?' }).should('exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      cy.visit('/fyllut/nav761318');
      cy.defaultWaits();
      cy.clickNextStep();
    });

    it('fills required fields and verifies summary', () => {
      cy.findByRole('checkbox', { name: 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.' }).click();
      cy.clickNextStep();

      fillTiltaksarrangor();
      cy.clickNextStep();

      fillKurset();
      cy.clickNextStep();

      fillDeltakeren();

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();

      cy.findByRole('group', { name: /Faktura/ }).within(() => {
        cy.findByRole('checkbox').check();
      });
      cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
        cy.findByRole('radio', { name: /Nei, jeg har ingen ekstra dokumentasjon/ }).click();
      });
      cy.clickNextStep();

      cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
      cy.withinSummaryGroup('Tiltaksarrangør', () => {
        cy.get('dt').eq(0).should('contain.text', 'Navn på utdanningsinstitusjon eller kursarrangør');
        cy.get('dd').eq(0).should('contain.text', 'Test Kurs AS');
      });
      cy.withinSummaryGroup('Kurset', () => {
        cy.contains('dt', 'Beløp du krever refundert nå')
          .next('dd')
          .should('contain.text', '25')
          .and('contain.text', '000');
      });
      cy.withinSummaryGroup('Deltakeren', () => {
        cy.get('dt').eq(0).should('contain.text', 'Fornavn');
        cy.get('dd').eq(0).should('contain.text', 'Ola');
      });
    });
  });
});
