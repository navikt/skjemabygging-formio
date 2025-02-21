import { expect } from 'chai';

describe('Pdf when digital submission', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsMellomlagring();
    cy.mocksRestoreRouteVariants();
  });

  after(() => {
    cy.mocksRestoreRouteVariants();
  });

  describe('Html content is as expected', () => {
    it('bokmaal', () => {
      cy.mocksUseRouteVariant('post-exstream-pdf:verify-nav111221b-nb');
      cy.mocksUseRouteVariant('get-activities:success');
      cy.submitMellomlagring((req) => {
        expect(req.body.attachments).to.have.length(0);
        expect(req.body.otherDocumentation).to.eq(true);
      });

      cy.visit('/fyllut/nav111221b?sub=digital');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Veiledning' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();
      cy.findByRole('heading', { name: 'Dine opplysninger' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: /Arbeidstrening:.*/ })
            .should('exist')
            .click();
        });
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Reiseperiode' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Startdato.*/ })
        .should('exist')
        .type('02.01.2024');
      cy.findByRole('textbox', { name: /Sluttdato.*/ })
        .should('exist')
        .type('31.01.2024');
      cy.findByRole('textbox', { name: 'Hvor mange reisedager har du per uke?' }).should('exist').type('3');
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Reiseavstand' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Har du en reisevei på seks kilometer eller mer?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('textbox', { name: 'Hvor lang reisevei har du?' }).should('exist').type('12');
      cy.findByRole('textbox', { name: 'Gateadresse' }).should('exist').type('Veien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Plassen');

      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Transportbehov' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Kan du reise kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Hva er hovedårsaken til at du ikke kan reise kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Dårlig transporttilbud' }).should('exist').click();
        });
      cy.findByRole('textbox', {
        name: 'Beskriv de spesielle forholdene ved reiseveien som gjør at du ikke kan reise kollektivt',
      })
        .should('exist')
        .type('Ingen buss kjører her i nærheten');
      cy.findByRole('group', { name: 'Kan du benytte egen bil?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kommer du til å ha utgifter til parkering på aktivitetsstedet?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Hvor ofte ønsker du å sende inn kjøreliste?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: /.*gang i uken.*/ })
            .should('exist')
            .click();
        });

      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Tilleggsopplysninger' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      // Submit
      cy.clickSaveAndContinue();
      // When failure, see mocks/routes/skjemabygging-proxy.js where the html content is verified (id='verify-nav111221b-nb')
      cy.wait('@submitMellomlagring');
      cy.url().should('include', '/send-inn-frontend');
    });

    it('nynorsk', () => {
      cy.mocksUseRouteVariant('post-exstream-pdf:verify-nav111221b-nn');
      cy.mocksUseRouteVariant('get-activities:success');
      cy.submitMellomlagring((req) => {
        expect(req.body.attachments).to.have.length(0);
        expect(req.body.otherDocumentation).to.eq(true);
      });

      cy.visit('/fyllut/nav111221b?sub=digital&lang=nn-NO');
      cy.defaultWaits();
      cy.clickStart();
      cy.findByRole('heading', { name: 'Veiledning' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();
      cy.findByRole('heading', { name: 'Dine opplysningar' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('group', { name: 'Velg hvilken aktivitet du vil søke om stønad for' })
        .should('exist')
        .within(() => {
          cy.findAllByRole('radio').should('have.length', 2);
          cy.findByRole('radio', { name: /Arbeidstrening:.*/ })
            .should('exist')
            .click();
        });
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Reiseperiode' }).shouldBeVisible();
      cy.findByRole('textbox', { name: /Startdato.*/ })
        .should('exist')
        .type('02.01.2024');
      cy.findByRole('textbox', { name: /Sluttdato.*/ })
        .should('exist')
        .type('31.01.2024');
      cy.findByRole('textbox', { name: 'Kor mange reisedagar har du per veke?' }).should('exist').type('3');
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Reiseavstand' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Har du ein reiseveg på seks kilometer eller meir?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('textbox', { name: 'Kor lang reiseveg har du?' }).should('exist').type('12');
      cy.findByRole('textbox', { name: 'Gateadresse' }).should('exist').type('Veien 1');
      cy.findByRole('textbox', { name: 'Postnummer' }).should('exist').type('1234');
      cy.findByRole('textbox', { name: 'Poststed' }).should('exist').type('Plassen');

      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Transportbehov' }).shouldBeVisible();
      cy.findByRole('group', { name: 'Kan du reisa kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kva er hovudårsaka til at du ikkje kan reisa kollektivt?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Dårleg transporttilbod' }).should('exist').click();
        });
      cy.findByRole('textbox', {
        name: 'Beskriv dei spesielle forholda ved reisevegen som gjer at du ikkje kan reisa kollektivt',
      })
        .should('exist')
        .type('Ingen buss køyrer her i nærleiken');
      cy.findByRole('group', { name: 'Kan du nytta eigen bil?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Ja' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kjem du til å ha utgifter til parkering på aktivitetsstaden?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: 'Nei' }).should('exist').click();
        });
      cy.findByRole('group', { name: 'Kor ofte ønskjer du å senda inn køyreliste?' })
        .should('exist')
        .within(() => {
          cy.findByRole('radio', { name: /.*gong i veka.*/ })
            .should('exist')
            .click();
        });

      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      cy.findByRole('heading', { name: 'Tilleggsopplysninger' }).shouldBeVisible();
      cy.findByRole('button', { name: 'Lagre og fortsett' }).click();

      // Submit
      cy.clickSaveAndContinue();
      // When failure, see mocks/routes/skjemabygging-proxy.js where the html content is verified (id='verify-nav111221b-nn')
      cy.wait('@submitMellomlagring');
      cy.url().should('include', '/send-inn-frontend');
    });
  });
});
