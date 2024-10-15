/*
 * Tests that the fields that have prefillKey set in the form definition will be prefilled with data
 */

import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { DateTime } from 'luxon';

describe('Your information', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.defaultInterceptsExternal();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Digital', () => {
    describe('New application', () => {
      beforeEach(() => {
        cy.visit('/fyllut/your-information?sub=digital');
        cy.defaultWaits();
        cy.clickStart();
        cy.wait('@getPrefillData');
        cy.wait('@createMellomlagring');
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      });

      it('Should prefill data for new application on the first page (name)', () => {
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '08842748500');
        cy.findByRole('textbox', { name: 'Vegadresse' }).should('have.value', 'Testveien 1C');
        cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '1234');
        cy.findByRole('textbox', { name: 'Poststed' }).should('have.value', 'Plassen');
        cy.get('.navds-alert').should('have.length', 1);
      });

      it('Should prefill data for new application on the second page (name)', () => {
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Navn' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
      });

      it('Should not have any validation messages on summary page when using prefill', () => {
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
        cy.clickSaveAndContinue();

        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Oppsummering' }).should('exist');

        cy.get('dl')
          .eq(0)
          .within(() => {
            cy.get('dd').eq(0).should('contain.text', 'Ola');
            cy.get('dd').eq(1).should('contain.text', 'Nordmann');
            cy.get('dd').eq(2).should('contain.text', '08842748500');
            cy.get('dd').eq(3).should('contain.text', 'Testveien 1C, 1234 Plassen');
          });

        cy.get('dl')
          .eq(1)
          .within(() => {
            cy.get('dd').eq(0).should('contain.text', 'Ola');
            cy.get('dd').eq(1).should('contain.text', 'Nordmann');
          });

        cy.get('.navds-alert').should('have.length', 0);
      });
    });

    describe('Existing application', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

        cy.visit('/fyllut/your-information/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
        cy.defaultWaits();
        cy.wait('@getPrefillData');
      });

      it('Should prefill data for existing application on the first page', () => {
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '08842748500');
        cy.findByRole('textbox', { name: 'Vegadresse' }).should('have.value', 'Testveien 1C');
        cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '1234');
        cy.findByRole('textbox', { name: 'Poststed' }).should('have.value', 'Plassen');
        cy.get('.navds-alert').should('have.length', 1);

        // Should not use existing data from innsending-api (database)
        cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'John');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Doe');
      });

      it('Should prefill data for existing application on the second page (name)', () => {
        cy.clickSaveAndContinue();

        cy.findByRole('heading', { name: 'Navn' }).should('exist');
        cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'Ola');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Nordmann');

        // Should not use existing data from innsending-api (database)
        cy.findByRole('textbox', { name: 'Fornavn' }).should('not.have.value', 'John');
        cy.findByRole('textbox', { name: 'Etternavn' }).should('not.have.value', 'Cena');
      });
    });
  });

  describe('Paper', () => {
    beforeEach(() => {
      cy.visit('/fyllut/your-information?sub=paper');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
    });

    it('Should not prefill data for new application if submissionMethod is paper', () => {
      // Should not make a request to get prefill data
      cy.get('@getPrefillData').then((interception) => {
        assert.isNull(interception);
      });
    });

    it('Social security number', () => {
      cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
        cy.findByLabelText('Ja').check(),
      );
      cy.get('.navds-alert').should('have.length', 1);
      cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).type('08842748500');
      cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');

      cy.clickNextStep();
      cy.findByRole('heading', { name: 'Navn' }).should('exist');
    });

    describe('No social security number', () => {
      it('Lives abroad', () => {
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
          cy.findByLabelText('Nei').check(),
        );
        cy.get('.navds-alert').should('have.length', 0);
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('not.exist');
        cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Nei').check());

        cy.findByRole('textbox', { name: /^C\/O/ }).type('Til denne personen');
        cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).type('Testveien 1C');
        cy.findByRole('textbox', { name: /^Bygning/ }).type('a');
        cy.findByRole('textbox', { name: /^Postnummer/ }).type('1234');
        cy.findByRole('textbox', { name: /^By \/ stedsnavn/ }).type('Plassen');
        cy.findByRole('textbox', { name: /^Region/ }).type('Øst');
        cy.findByRole('textbox', { name: /^Land/ }).type('Sverige');
        cy.findByRole('textbox', { name: /^Gyldig fra/ }).type(
          DateTime.now().minus({ days: 300 }).toFormat(dateUtils.inputFormat),
        );
        cy.findByRole('textbox', { name: /^Gyldig til/ }).type(DateTime.now().toFormat(dateUtils.inputFormat));

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Navn' }).should('exist');
      });

      it('Lives in Norway with address', () => {
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
          cy.findByLabelText('Nei').check(),
        );
        cy.get('.navds-alert').should('have.length', 0);
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('not.exist');
        cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen din en vegadresse eller postboksadresse?' }).within(
          ($radio) => cy.findByLabelText('Vegadresse').check(),
        );

        cy.findByRole('textbox', { name: /^C\/O/ }).type('Til denne personen');
        cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1C');
        cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
        cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen');
        cy.findByRole('textbox', { name: /^Gyldig fra/ }).type(DateTime.now().toFormat(dateUtils.inputFormat));
        cy.findByRole('textbox', { name: /^Gyldig til/ }).type(
          DateTime.now().plus({ days: 1 }).toFormat(dateUtils.inputFormat),
        );

        // Quick check to make sure we do not have any extra address fields. First name, surname, birthdate and the rest address fields
        cy.findAllByRole('textbox').should('have.length', 9);

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Navn' }).should('exist');
      });

      it('Lives in Norway with po address', () => {
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
          cy.findByLabelText('Nei').check(),
        );
        cy.get('.navds-alert').should('have.length', 0);
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('not.exist');
        cy.findByRole('textbox', { name: /Din fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen din en vegadresse eller postboksadresse?' }).within(
          ($radio) => cy.findByLabelText('Postboksadresse').check(),
        );

        cy.findByRole('textbox', { name: /^C\/O/ }).type('Til denne personen');
        cy.findByRole('textbox', { name: 'Postboks' }).type('Postboksen');
        cy.findByRole('textbox', { name: 'Postnummer' }).type('1234');
        cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen');
        cy.findByRole('textbox', { name: /^Gyldig fra/ }).type(DateTime.now().toFormat(dateUtils.inputFormat));
        cy.findByRole('textbox', { name: /^Gyldig til/ }).type(
          DateTime.now().plus({ days: 300 }).toFormat(dateUtils.inputFormat),
        );

        // Quick check to make sure we do not have any extra address fields. First name, surname, birthdate and the rest address fields
        cy.findAllByRole('textbox').should('have.length', 9);

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Navn' }).should('exist');
      });
    });
  });
});
