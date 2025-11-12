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
      describe('Lives in Norway', () => {
        beforeEach(() => {
          cy.visit('/fyllut/yourinformation?sub=digital');
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
              cy.get('dd').eq(2).should('contain.text', '088427 48500');
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

      describe('Lives in USA', () => {
        beforeEach(() => {
          cy.mocksUseRouteVariant('get-prefill-data:success-usa');
          cy.visit('/fyllut/yourinformation?sub=digital');
          cy.defaultWaits();
          cy.clickStart();
          cy.wait('@getPrefillData');
          cy.wait('@createMellomlagring');
          cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        });

        it('Lives abroad', () => {
          cy.findByRole('group', { name: 'Bor du i Norge?' }).should('not.exist');
          cy.findByRole('textbox', { name: 'Fornavn' }).should('have.value', 'John');
          cy.findByRole('textbox', { name: 'Etternavn' }).should('have.value', 'Doe');
          cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('have.value', '06882549354');
          cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).should(
            'have.value',
            'The Landmark Building, 1 Market St',
          );
          cy.findByRole('textbox', { name: 'Postnummer' }).should('have.value', '94105');
          cy.findByRole('textbox', { name: 'By / stedsnavn' }).should('have.value', 'San Francisco');
          cy.findByRole('combobox', { name: /Land/ }).get('p').contains('USA');

          cy.clickSaveAndContinue();
          cy.clickSaveAndContinue();

          cy.get('dl')
            .eq(0)
            .within(() => {
              cy.get('dt').eq(3).should('contain.text', 'Adresse');
              cy.get('dd').eq(3).should('contain.text', 'The Landmark Building, 1 Market St, 94105 San Francisco, USA');
            });
        });
      });
    });

    describe('Existing application', () => {
      beforeEach(() => {
        cy.mocksUseRouteVariant('get-soknad:success-prefill-data');

        cy.visit('/fyllut/yourinformation/side1?sub=digital&innsendingsId=d2f41ebc-ba98-4fc5-a195-29b098bf50a7');
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
      cy.visit('/fyllut/yourinformation?sub=paper');
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
      beforeEach(() => {
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
          cy.findByLabelText('Nei').check(),
        );
      });

      it('Does not show alert nor input for ssn', () => {
        cy.get('.navds-alert').should('have.length', 0);
        cy.findByRole('textbox', { name: 'Fødselsnummer eller d-nummer' }).should('not.exist');
      });

      it('Lives abroad', () => {
        cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Nei').check());

        cy.findByRole('textbox', { name: /^C\/O/ }).type('Til denne personen');
        cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).type('Testveien 1C');
        cy.findByRole('textbox', { name: /^Bygning/ }).type('a');
        cy.findByRole('textbox', { name: /^Postnummer/ }).type('1234');
        cy.findByRole('textbox', { name: /^By \/ stedsnavn/ }).type('Plassen');
        cy.findByRole('textbox', { name: /^Region/ }).type('Øst');
        cy.findByRole('combobox', { name: /^Land/ }).type('Sverige{downArrow}{enter}');
        cy.findByRole('textbox', { name: /^Gyldig fra/ }).type(
          DateTime.now().minus({ days: 300 }).toFormat(dateUtils.inputFormat),
        );
        cy.findByRole('textbox', { name: /^Gyldig til/ }).type(DateTime.now().toFormat(dateUtils.inputFormat));

        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Navn' }).should('exist');
      });

      it('Lives in Norway with address', () => {
        cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(($radio) =>
          cy.findByLabelText('Vegadresse').check(),
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
        cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(($radio) =>
          cy.findByLabelText('Postboksadresse').check(),
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

      describe('Validation of Birth date and Lives in Norway', () => {
        it('Shows validation messages near input', () => {
          cy.clickNextStep();

          cy.findByRole('textbox', { name: /Fødselsdato/ })
            .should('exist')
            .invoke('attr', 'aria-describedby')
            .then((describedById) => {
              cy.get(`#${describedById}`).should('have.text', 'Du må fylle ut: Fødselsdato (dd.mm.åååå)');
            });

          cy.findByRole('group', { name: 'Bor du i Norge?' })
            .should('exist')
            .within(() => {
              cy.findByRole('radio', { name: 'Ja' })
                .should('exist')
                .should('not.be.checked')
                .invoke('attr', 'aria-describedby')
                .then((describedById) => {
                  cy.get(`#${describedById}`).should('have.text', 'Du må fylle ut: Bor du i Norge?');
                });
            });
        });

        it('Shows message in error summary and focus input on click', () => {
          cy.clickNextStep();

          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(100);
          cy.get('[data-cy=error-summary]')
            .should('exist')
            .within(() => {
              cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ }).should('have.length', 2);
              cy.findByRole('link', { name: 'Du må fylle ut: Bor du i Norge?' }).should('exist').click();
            });
          cy.findByRole('group', { name: 'Bor du i Norge?' }).should('have.focus');
        });
      });

      describe('Validation of Street address or Po radio', () => {
        beforeEach(() => {
          cy.findByRole('textbox', { name: /Fødselsdato/ }).type('01.01.1980');
          cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());
          cy.clickNextStep();
        });

        it('Shows validation message beneath radio', () => {
          cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' })
            .should('exist')
            .within(() => {
              cy.findByRole('radio', { name: 'Postboksadresse' })
                .should('exist')
                .should('not.be.checked')
                .invoke('attr', 'aria-describedby')
                .then((describedById) => {
                  cy.get(`#${describedById}`).should(
                    'have.text',
                    'Du må fylle ut: Er kontaktadressen en vegadresse eller postboksadresse?',
                  );
                });
            });
        });

        it('Shows validation message in error summary and focus radio on click', () => {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(100);

          cy.get('[data-cy=error-summary]')
            .should('exist')
            .within(() => {
              cy.findAllByRole('link', { name: /^Du må fylle ut: .*/ }).should('have.length', 1);
              cy.findByRole('link', { name: 'Du må fylle ut: Er kontaktadressen en vegadresse eller postboksadresse?' })
                .should('exist')
                .click();
            });
          cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).should(
            'have.focus',
          );
        });
      });
    });
  });

  describe('Validation', () => {
    describe('New application', () => {
      beforeEach(() => {
        cy.visit('/fyllut/yourinformation?sub=paper');
        cy.defaultWaits();
        cy.clickStart();
        cy.findByRole('heading', { name: 'Dine opplysninger' }).should('exist');
        cy.findByRole('group', { name: 'Har du norsk fødselsnummer eller d-nummer?' }).within(($radio) =>
          cy.findByLabelText('Nei').check(),
        );
      });

      it('validates invalid characters for Norwegian street address fields', () => {
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(($radio) =>
          cy.findByLabelText('Vegadresse').check(),
        );

        cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola #<}');
        cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann #<}');

        cy.findByRole('textbox', { name: /^C\/O/ }).type('CO #<}');
        cy.findByRole('textbox', { name: 'Vegadresse' }).type('Testveien 1C #<}');
        cy.findByRole('textbox', { name: 'Postnummer' }).type('abc');
        cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen #<}');
        cy.clickNextStep();

        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', {
              name: 'Fornavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Etternavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'C/O inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Vegadresse inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Postnummer må bestå av 4 siffer',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Poststed inneholder ugyldige tegn',
            }).should('exist');
          });
      });

      it('validates invalid characters for Norwegian PO box address fields', () => {
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Ja').check());

        cy.findByRole('group', { name: 'Er kontaktadressen en vegadresse eller postboksadresse?' }).within(($radio) =>
          cy.findByLabelText('Postboksadresse').check(),
        );

        cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola #<}');
        cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann #<}');

        cy.findByRole('textbox', { name: /^C\/O/ }).type('CO #<}');
        cy.findByRole('textbox', { name: 'Postboks' }).type('Testveien 1C #<}');
        cy.findByRole('textbox', { name: 'Postnummer' }).type('abcd');
        cy.findByRole('textbox', { name: 'Poststed' }).type('Plassen #<}');
        cy.clickNextStep();

        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', {
              name: 'Fornavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Etternavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'C/O inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Postboks inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Postnummer må bestå av 4 siffer',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Poststed inneholder ugyldige tegn',
            }).should('exist');
          });
      });

      it('validates invalid characters for Foreign address fields', () => {
        cy.findByRole('group', { name: 'Bor du i Norge?' }).within(($radio) => cy.findByLabelText('Nei').check());

        cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola #<}');
        cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann #<}');

        cy.findByRole('textbox', { name: /^C\/O/ }).type('CO #<}');
        cy.findByRole('textbox', { name: 'Vegnavn og husnummer, eller postboks' }).type('Testveien 1C #<}');
        cy.findByRole('textbox', { name: 'Bygning (valgfritt)' }).type('bygning 2 #<}');
        cy.findByRole('textbox', { name: 'Postnummer (valgfritt)' }).type('abcd #<}');
        cy.findByRole('textbox', { name: 'By / stedsnavn (valgfritt)' }).type('By #<}');
        cy.findByRole('textbox', { name: 'Region (valgfritt)' }).type('Region #<}');
        cy.clickNextStep();

        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', {
              name: 'Fornavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Etternavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'C/O inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Vegnavn og husnummer, eller postboks inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Bygning inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Postnummer inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'By / stedsnavn inneholder ugyldige tegn',
            }).should('exist');
            cy.findByRole('link', {
              name: 'Region inneholder ugyldige tegn',
            }).should('exist');
          });
      });
    });

    describe('when english is chosen', () => {
      beforeEach(() => {
        cy.visit('/fyllut/yourinformation?sub=paper&lang=en');
        cy.defaultWaits();
        cy.clickNextStep();
        cy.findByRole('heading', { name: 'Your personal information' }).should('exist');
        cy.findByRole('textbox', { name: 'First name' }).type('Ola');
        cy.findByRole('textbox', { name: 'Last name' }).type('Nordmann');
      });

      it('renders validation messages in error summary when no ssn', () => {
        cy.findByRole('group', { name: 'Do you have a Norwegian national identification number or d number?' }).within(
          () => cy.findByLabelText('No').check(),
        );

        cy.clickNextStep();
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', {
              name: 'You must fill in: Date of birth (dd.mm.yyyy)',
            }).should('exist');
            cy.findByRole('link', {
              name: 'You must fill in: Do you live in Norway?',
            }).should('exist');
          });
      });

      it('renders validation messages in error summary when ssn', () => {
        cy.findByRole('group', { name: 'Do you have a Norwegian national identification number or d number?' }).within(
          () => cy.findByLabelText('Yes').check(),
        );

        cy.clickNextStep();
        cy.get('[data-cy=error-summary]')
          .should('exist')
          .within(() => {
            cy.findByRole('link', {
              name: 'You must fill in: Norwegian national identification number or D number',
            }).should('exist');
          });
      });
    });
  });
});
