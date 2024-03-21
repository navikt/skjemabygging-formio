describe('Translations', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/config', { fixture: 'config.json' }).as('getConfig');
  });

  describe('Form translations', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tst123456', { fixture: 'form123456.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/tst123456', { statusCode: 404 }).as('getPublishedForm');
      cy.intercept('GET', '/api/countries?*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
    });

    describe('when loading of translations succeeds', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');

        cy.visit('/forms/tst123456');
        cy.wait('@getForm');
        cy.wait('@getTranslations', { timeout: 10000 });
      });

      it('shows translated texts for chosen language', () => {
        cy.findByRole('link', { name: 'Språk' }).click();
        cy.findByDisplayValue('Annan dokumentasjon', { timeout: 10000 }).should('exist');
        cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
        cy.findByRole('link', { name: 'Engelsk' }).click();
        cy.findByDisplayValue('Other documentation').should('exist');
      });
    });

    describe('when loading of translations fails', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { statusCode: 500, body: 'Failed to load translations' }).as(
          'getTranslationsFailure',
        );

        cy.visit('/forms/tst123456');
        cy.wait('@getForm');
        cy.wait('@getTranslationsFailure', { timeout: 10000 });
      });

      it('shows error message', () => {
        cy.findByRole('link', { name: 'Språk' }).click();
        cy.findAllByText('Henting av oversettelser for dette skjemaet feilet. Last siden på nytt.').should(
          'be.visible',
        );
      });
    });
  });

  describe('Global translations', () => {
    beforeEach(() => {
      cy.intercept('GET', /\/api\/forms\\?.+/, { body: [] }).as('getForms');
    });

    describe('when loading of global translations succeeds', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { fixture: 'globalTranslations.json' }).as('getTranslations');
        cy.visit('/');
      });

      it('shows translated texts for chosen language', () => {
        cy.findByRole('button', { name: 'Åpne meny' }).click();
        cy.findByRole('link', { name: 'Globale Oversettelser' }).click();
        cy.findByRole('heading', { name: 'Norsk nynorsk' }).should('exist');
        cy.findByDisplayValue('Annan dokumentasjon');
        cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
        cy.findByRole('link', { name: 'Engelsk' }).click();
        cy.findByRole('heading', { name: 'Engelsk' }).should('exist');
        cy.findByDisplayValue('Other documentation').should('exist');
      });
    });

    describe('when loading of global translations fails', () => {
      beforeEach(() => {
        cy.intercept('GET', /language\/submission?.*/, { statusCode: 500, body: 'Failed to load translations' }).as(
          'getTranslationsFailure',
        );
        cy.visit('/');
      });

      it('shows error message', () => {
        cy.findByRole('button', { name: 'Åpne meny' }).click();
        cy.findByRole('link', { name: 'Globale Oversettelser' }).click();
        cy.findByRole('heading', { name: 'Norsk nynorsk' }).should('exist');
        cy.wait('@getTranslationsFailure');
        cy.findAllByText('Henting av globale oversettelser feilet. Last siden på nytt.').should('be.visible');
      });
    });
  });

  const assessHtmlTranlationInput = (
    indexOfHtmlItem: number,
    labelOfHtmlItem: string,
    fieldLabel: string,
    existingValue: string,
  ) => {
    cy.get('[data-testid=html-translation]')
      .eq(indexOfHtmlItem)
      .within(() => {
        cy.findAllByRole('heading', {
          name: labelOfHtmlItem,
        }).should('be.visible');
        cy.findByRole('textbox', {
          name: fieldLabel,
        }).should('have.value', existingValue);
      });
  };
  const typeNewHtmlTranslationInput = (indexOfHtmlItem: number, fieldLabel: string, newValue: string) => {
    return cy
      .get('[data-testid=html-translation]')
      .eq(indexOfHtmlItem)
      .within(() => {
        cy.findByRole('textbox', { name: fieldLabel }).focus();
        cy.findByRole('textbox', { name: fieldLabel }).clear();
        cy.findByRole('textbox', { name: fieldLabel }).type(
          newValue,
          // { force: true },
        );
        cy.findByRole('textbox', { name: fieldLabel }).blur();
      });
  };

  describe('Form translations - html', () => {
    const htmlWithExistingTranslation =
      '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">med lenke til VG</a> og her kommer en liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.coop.no/"><strong>matvarer</strong></a>, og <strong>vurder</strong> å <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';

    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tekstblokk123', { fixture: 'tekstblokk123.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/formWithTekstblokk', { statusCode: 404 }).as('getPublishedForm');
      cy.intercept('GET', '/api/countries?*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
      cy.intercept('GET', /language\/submission?.*/, { fixture: 'tekstblokk123Translations.json' }).as(
        'getTranslations',
      );
      cy.intercept('PUT', /language\/submission?.*/).as('updateTranslations');

      cy.visit('/forms/tekstblokk123');
      cy.wait('@getForm');
      cy.findByRole('link', { name: 'Språk' }).click();
      cy.wait('@getTranslations', { timeout: 10000 });
    });

    it('lets you edit old versions of translations and start new translations', () => {
      const expectedI18n = {
        'Du må selv skrive under på leveattesten. I tillegg må du få bekreftet attesten enten av to myndige personer (vitner) eller av en offentlig myndighet.':
          'Du må sjølv skrive....',
        '<h3>Overskrift</h3><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>':
          '<h3>Overskrift</h3><p>Beskrivelse med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no/minside">lenke til minside</a>.</p>',
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">med lenke til VG</a> og her kommer en liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.coop.no/"><strong>matvarer</strong></a>, og <strong>vurder</strong> å <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>':
          '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.dagogtid.no">med lenke til DAG OG TID</a>, og her er ei ei liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>',
      };
      cy.get('[data-testid=html-translation]').should('have.length', 3);
      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Overskrift' }).should('be.visible');
          cy.findAllByRole('textbox').should('have.length', 0);
          cy.findByRole('button', { name: 'Start ny oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).click();
        });
      cy.get('[data-testid=html-translation]').should('have.length', 2);
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).should('be.visible');
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).click();
      cy.get('[data-testid=html-translation]').should('have.length', 3);
      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Overskrift' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).click();
          cy.findByRole('textbox', { name: 'Overskrift' }).should('be.visible');
          cy.findByRole('textbox', {
            name: 'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
          }).should('have.value', 'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).');
        });
      typeNewHtmlTranslationInput(
        0,
        'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
        'Beskrivelse med [lenke til minside](https://www.nav.no/minside).',
      );

      cy.get('[data-testid=html-translation]')
        .last()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Tekstblokk med mye formatering og manglende oversettelse' }).should(
            'be.visible',
          );
          cy.findAllByRole('textbox').should('have.length', 0);
          cy.findAllByRole('button').should('have.length', 1);
          cy.findByRole('button', { name: 'Start ny oversettelse' }).click();
        });
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        // eslint-disable-next-line vitest/valid-expect
        expect(interception.request.body.data.i18n).to.deep.equal(expectedI18n);
      });
    });

    it('lets you change links', () => {
      const expectedHtmlResult =
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.ap.no">med lenke til AFTENPOSTEN</a>. Her kommer ei liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';
      const paragraphWithLink = 'Her er et avsnitt [med lenke til VG](https://www.vg.no) og her kommer en liste:';
      assessHtmlTranlationInput(
        1,
        'Tekstblokk med mye formatering og eksisterende oversettelse',
        paragraphWithLink,
        'Her er eit avsnitt [med lenke til DAG OG TID](https://www.dagogtid.no), og her er ei ei liste:',
      );
      typeNewHtmlTranslationInput(
        1,
        paragraphWithLink,
        'Her er eit avsnitt [med lenke til AFTENPOSTEN](https://www.ap.no). Her kommer ei liste:',
      );
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        // eslint-disable-next-line vitest/valid-expect
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('updates the tranlation of a list item without affecting the other list items', () => {
      const updatedTranslation =
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.dagogtid.no">med lenke til DAG OG TID</a>, og her er ei ei liste:</p><ul><li>Ta ut av oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Ganske viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';
      const listItem1 = 'Ta oppvasken';
      const listItem2 = 'Også viktig, men ikke så viktig';
      typeNewHtmlTranslationInput(1, listItem1, 'Ta ut av oppvasken');
      typeNewHtmlTranslationInput(1, listItem2, 'Ganske viktig');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        console.log('INTERCEPTION', JSON.stringify(interception.request.body, null, 2));
        // eslint-disable-next-line vitest/valid-expect
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.equal(updatedTranslation);
      });
    });
  });
});
