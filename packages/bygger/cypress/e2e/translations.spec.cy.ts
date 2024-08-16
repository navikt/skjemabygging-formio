import { expect } from 'chai';

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
        cy.wait('@getTranslations');
      });

      it('shows translated texts for chosen language', () => {
        cy.findByRole('link', { name: 'Språk' }).click();
        cy.findByDisplayValue('Annan dokumentasjon').should('exist');
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
        cy.wait('@getTranslationsFailure');
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
        if (newValue) {
          cy.findByRole('textbox', { name: fieldLabel }).type(newValue);
        }
        cy.findByRole('textbox', { name: fieldLabel }).blur();
      });
  };

  describe('Form translations - html', () => {
    const existingTranslations = {
      'Du må selv skrive under på leveattesten. I tillegg må du få bekreftet attesten enten av to myndige personer (vitner) eller av en offentlig myndighet.':
        'Du må sjølv skrive....',
      '<h4>Overskrift</h4><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>':
        '<h2>Overskrift</h2><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>',
      '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">med lenke til VG</a> og her kommer en liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.coop.no/"><strong>matvarer</strong></a>, og <strong>vurder</strong> å <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>':
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.dagogtid.no">med lenke til DAG OG TID</a>, og her er ei ei liste:</p><ul><li>Ta oppvasken</li><li><a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>Handle matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>',
      '<p>Dette er en <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">lenke som åpnes i ny fane</a>.</p>':
        '<p>Dette er en <a href="https://www.vg.no">lenke som åpnes i ny fane</a>.</p>',
      Søker: 'Søkar',
    };
    const htmlWithExistingTranslation =
      '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">med lenke til VG</a> og her kommer en liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.coop.no/"><strong>matvarer</strong></a>, og <strong>vurder</strong> å <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';
    const htmlWithNoTranslation =
      '<h3>Tekstblokk med mye formatering og manglende oversettelse</h3><p>Dette er avsnitt 1</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">med lenke til VG</a>. Denne er så lang at den bør få et tekstområde, altså en sånn stor boks hvor man kan skrive inn masse tekst. Her kommer en liste:</p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.coop.no/"><strong>matvarer</strong></a>, og <strong>vurder</strong> å <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';

    beforeEach(() => {
      cy.intercept('GET', '/api/forms/tekstblokk123', { fixture: 'tekstblokk123.json' }).as('getForm');
      cy.intercept('GET', '/api/published-forms/tekstblokk123', { statusCode: 404 }).as('getPublishedForm');
      cy.intercept('GET', '/api/countries?*', { fixture: 'getCountriesLangNb.json' }).as('getCountriesLangNb');
      cy.intercept('GET', /language\/submission?.*/, { fixture: 'tekstblokk123Translations.json' }).as(
        'getTranslations',
      );
      cy.intercept('PUT', /language\/submission?.*/).as('updateTranslations');

      cy.visit('/forms/tekstblokk123');
      cy.wait('@getForm');
      cy.findByRole('link', { name: 'Språk' }).click();
      cy.wait('@getTranslations');
    });

    it('lets you edit old versions of translations and start new translation', () => {
      const expectedI18n = {
        ...existingTranslations,
        '<h4>Overskrift</h4><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>':
          '<h4></h4><p>Beskrivelse med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no/minside">lenke til minside</a>.</p>',
      };
      cy.get('[data-testid=html-translation]').should('have.length', 4);
      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Overskrift', level: 4 }).should('be.visible');
          cy.findAllByRole('textbox').should('have.length', 0);
          cy.findByRole('button', { name: 'Start ny oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).click();
        });
      cy.get('[data-testid=html-translation]').should('have.length', 3);
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).should('be.visible');
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).click();
      cy.get('[data-testid=html-translation]').should('have.length', 4);
      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Overskrift' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).click();
          cy.findByRole('textbox', { name: 'Overskrift' }).should('be.visible');
          cy.findByRole('textbox', {
            name: 'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
          }).should('have.value', '');
        });
      typeNewHtmlTranslationInput(
        0,
        'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
        'Litt tekst',
      );
      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findByRole('button', { name: 'Forkast og gå tilbake' }).should('be.visible');
          cy.findByRole('button', { name: 'Forkast og gå tilbake' }).click();
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Bruk eksisterende oversettelse' }).click();
        });

      // Tar vare på opprinnelig oversettelse selv om man har klikket på start ny, og begynt å redigere
      cy.findByRole('textbox', {
        name: '<h4>Overskrift</h4><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>',
      }).should(
        'have.value',
        '<h2>Overskrift</h2><p>Beskrivelse av dette skjemaet med <a target="_blank" rel="noopener noreferrer" href="https://www.nav.no">lenke til NAV</a>.</p>',
      );
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).should('be.visible');
      cy.findByRole('button', { name: 'Gå tilbake til vanlig HTML-oversetting' }).click();

      cy.get('[data-testid=html-translation]')
        .first()
        .within(() => {
          cy.findAllByRole('heading', { name: 'Overskrift' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).should('be.visible');
          cy.findByRole('button', { name: 'Start ny oversettelse' }).click();
          cy.findByRole('textbox', {
            name: 'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
          }).should('have.value', '');
        });
      typeNewHtmlTranslationInput(
        0,
        'Beskrivelse av dette skjemaet med [lenke til NAV](https://www.nav.no).',
        'Beskrivelse med [lenke til minside](https://www.nav.no/minside).',
      );

      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n).to.deep.equal(expectedI18n);
      });
    });

    it('starts new translation when there is no existing translation', () => {
      cy.get('[data-testid=html-translation]')
        .eq(2)
        .within(() => {
          cy.findAllByRole('heading', { name: 'Tekstblokk med mye formatering og manglende oversettelse' }).should(
            'be.visible',
          );
          cy.findAllByRole('textbox').should('have.length', 10);
          cy.findAllByRole('button').should('have.length', 1);
          cy.findAllByRole('button', { name: 'Bruk eksisterende oversettelse' }).should('have.length', 0);
          cy.findAllByRole('button', { name: 'Start ny oversettelse' }).should('have.length', 0);
        });
    });

    it('lets you change links', () => {
      const expectedHtmlResult =
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.ap.no">med lenke til AFTENPOSTEN</a>. Her kommer ei liste:</p><ul><li>Ta oppvasken</li><li><a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>Handle matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';

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
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('lets you remove and add text before links', () => {
      // Note that when a new text chunk is added a link may be created from scratch, and we won't be able to carry over existing attributes (see the link to zalando.no)
      const expectedHtmlResult =
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p><a target="_blank" rel="noopener noreferrer" href="https://www.dagogtid.no">Lenke til DAG OG TID</a></p><ul><li>Ta oppvasken</li><li>Handle <a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>matvarer</strong></a> kanskje, og <strong>tenk på om du skal</strong> vurdere å <a href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Også viktig, men ikke så viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';
      const htmlItemLabel = 'Tekstblokk med mye formatering og eksisterende oversettelse';
      const paragraphWithTextAndLink =
        'Her er et avsnitt [med lenke til VG](https://www.vg.no) og her kommer en liste:';
      const listItemThatStartsWithALink =
        'Handle [**matvarer**](https://www.coop.no/), og **vurder** å [kjøpe **nye** klær](https://www.zalando.no).';
      assessHtmlTranlationInput(
        1,
        htmlItemLabel,
        paragraphWithTextAndLink,
        'Her er eit avsnitt [med lenke til DAG OG TID](https://www.dagogtid.no), og her er ei ei liste:',
      );
      typeNewHtmlTranslationInput(1, paragraphWithTextAndLink, '[Lenke til DAG OG TID](https://www.dagogtid.no)');
      assessHtmlTranlationInput(
        1,
        htmlItemLabel,
        listItemThatStartsWithALink,
        '[**Handle matvarer**](https://www.kiwi.no/), og **tenk på om du skal** [kjøpe **nye** klær](https://www.zalando.no).',
      );
      typeNewHtmlTranslationInput(
        1,
        listItemThatStartsWithALink,
        'Handle [**matvarer**](https://www.kiwi.no/) kanskje, og **tenk på om du skal** vurdere å [kjøpe **nye** klær](https://www.zalando.no).',
      );
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('preserves attributes of links', () => {
      const expectedHtmlResult =
        '<h3>Overskrift</h3><p>Avsnitt</p><p>Her er et avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.nyheter.no">med lenke til nyheter</a>.</p><ul><li></li><li><a target="_blank" rel="noopener noreferrer"><strong></strong></a><strong></strong><a target="_blank" rel="noopener noreferrer"><strong></strong></a></li></ul><p></p><ol><li></li><li></li><li></li><li></li></ol>';
      const heading = 'Tekstblokk med mye formatering og manglende oversettelse';
      const paragraph = 'Dette er avsnitt 1';
      const paragraphWithTextAndLink =
        'Her er et avsnitt [med lenke til VG](https://www.vg.no). Denne er så lang at den bør få et tekstområde, altså en sånn stor boks hvor man kan skrive inn masse tekst. Her kommer en liste:';
      typeNewHtmlTranslationInput(2, heading, 'Overskrift');
      typeNewHtmlTranslationInput(2, paragraph, 'Avsnitt');
      typeNewHtmlTranslationInput(
        2,
        paragraphWithTextAndLink,
        'Her er et avsnitt [med lenke til nyheter](https://www.nyheter.no).',
      );
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithNoTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('adds attributes from original html when field is cleared', () => {
      const html =
        '<p>Dette er en <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">lenke som åpnes i ny fane</a>.</p>';
      const markdown = 'Dette er en [lenke som åpnes i ny fane](https://www.vg.no).';
      const expectedHtmlResult =
        '<p>Dette er ei <a target="_blank" rel="noopener noreferrer" href="https://www.vg.no">lenkje som åpnes i ny fane</a>.</p>';
      typeNewHtmlTranslationInput(3, markdown, '');
      typeNewHtmlTranslationInput(3, markdown, 'Dette er ei [lenkje som åpnes i ny fane](https://www.vg.no).');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[html]).to.equal(expectedHtmlResult);
      });
    });

    it('lets you add new markdown for bold text', () => {
      const expectedHtmlResult =
        '<h3></h3><p><strong>Dette</strong> er et <strong>avsnitt med fet skrift</strong></p><p><a target="_blank" rel="noopener noreferrer"></a></p><ul><li></li><li><a target="_blank" rel="noopener noreferrer"><strong></strong></a><strong></strong><a target="_blank" rel="noopener noreferrer"><strong></strong></a></li></ul><p></p><ol><li></li><li></li><li></li><li></li></ol>';
      const paragraphWithLink = 'Dette er avsnitt 1';
      assessHtmlTranlationInput(2, 'Tekstblokk med mye formatering og manglende oversettelse', paragraphWithLink, '');
      typeNewHtmlTranslationInput(2, paragraphWithLink, '**Dette** er et **avsnitt med fet skrift**');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithNoTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('lets you add new markdown for links', () => {
      const expectedHtmlResult =
        '<h3></h3><p>Dette er en <a href="www.nav.no">lenke</a> som går til NAV.</p><p><a target="_blank" rel="noopener noreferrer"></a></p><ul><li></li><li><a target="_blank" rel="noopener noreferrer"><strong></strong></a><strong></strong><a target="_blank" rel="noopener noreferrer"><strong></strong></a></li></ul><p></p><ol><li></li><li></li><li></li><li></li></ol>';
      const paragraphWithLink = 'Dette er avsnitt 1';
      assessHtmlTranlationInput(2, 'Tekstblokk med mye formatering og manglende oversettelse', paragraphWithLink, '');
      typeNewHtmlTranslationInput(2, paragraphWithLink, 'Dette er en [lenke](www.nav.no) som går til NAV.');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithNoTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('updates the translation of a list item without affecting the other list items', () => {
      const updatedTranslation =
        '<h3>Tekstblokk med mye formatering og eksisterende oversettelse</h3><p>Dette er et avsnitt</p><p>Her er eit avsnitt <a target="_blank" rel="noopener noreferrer" href="https://www.dagogtid.no">med lenke til DAG OG TID</a>, og her er ei ei liste:</p><ul><li>Ta ut av oppvasken</li><li><a target="_blank" rel="noopener noreferrer" href="https://www.kiwi.no/"><strong>Handle matvarer</strong></a>, og <strong>tenk på om du skal</strong> <a target="_blank" rel="noopener noreferrer" href="https://www.zalando.no">kjøpe <strong>nye</strong> klær</a>.</li></ul><p>Nytt avsnitt. Ny liste (numerert denne gangen):</p><ol><li>Første prioritet</li><li>Ganske viktig</li><li>Kan utsettes</li><li>Trengs egentlig ikke å gjøres</li></ol>';
      const listItem1 = 'Ta oppvasken';
      const listItem2 = 'Også viktig, men ikke så viktig';
      typeNewHtmlTranslationInput(1, listItem1, 'Ta ut av oppvasken');
      typeNewHtmlTranslationInput(1, listItem2, 'Ganske viktig');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.equal(updatedTranslation);
      });
    });

    it('shows and changes translation for chosen language', () => {
      const expectedHtmlResult =
        '<h3></h3><p>This is paragraph 1</p><p><a target="_blank" rel="noopener noreferrer"></a></p><ul><li></li><li><a target="_blank" rel="noopener noreferrer"><strong></strong></a><strong></strong><a target="_blank" rel="noopener noreferrer"><strong></strong></a></li></ul><p></p><ol><li></li><li></li><li></li><li></li></ol>';
      const htmlItemLabel = 'Tekstblokk med mye formatering og eksisterende oversettelse';
      const htmlInputLabel = 'Her er et avsnitt [med lenke til VG](https://www.vg.no) og her kommer en liste:';
      cy.findByRole('heading', { name: 'Oversettelser på Norsk nynorsk' }).should('exist');
      assessHtmlTranlationInput(
        1,
        htmlItemLabel,
        htmlInputLabel,
        'Her er eit avsnitt [med lenke til DAG OG TID](https://www.dagogtid.no), og her er ei ei liste:',
      );
      cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
      cy.findByRole('link', { name: 'Engelsk' }).click();
      cy.findByRole('heading', { name: 'Oversettelser på Engelsk' }).should('exist');
      assessHtmlTranlationInput(
        1,
        htmlItemLabel,
        htmlInputLabel,
        'Here comes a paragraph [with a link to BBC](https://www.bbc.co.uk), and here is a list:',
      );
      assessHtmlTranlationInput(
        2,
        'Tekstblokk med mye formatering og manglende oversettelse',
        'Dette er avsnitt 1',
        '',
      );
      typeNewHtmlTranslationInput(2, 'Dette er avsnitt 1', 'This is paragraph 1');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithNoTranslation]).to.equal(expectedHtmlResult);
      });
    });

    it('clears the translation when all inputs are empty', () => {
      typeNewHtmlTranslationInput(1, 'Tekstblokk med mye formatering og eksisterende oversettelse', '');
      typeNewHtmlTranslationInput(1, 'Dette er et avsnitt', '');
      typeNewHtmlTranslationInput(
        1,
        'Her er et avsnitt [med lenke til VG](https://www.vg.no) og her kommer en liste:',
        '',
      );
      typeNewHtmlTranslationInput(1, 'Ta oppvasken', '');
      typeNewHtmlTranslationInput(
        1,
        'Handle [**matvarer**](https://www.coop.no/), og **vurder** å [kjøpe **nye** klær](https://www.zalando.no).',
        '',
      );
      typeNewHtmlTranslationInput(1, 'Nytt avsnitt. Ny liste (numerert denne gangen):', '');
      typeNewHtmlTranslationInput(1, 'Første prioritet', '');
      typeNewHtmlTranslationInput(1, 'Også viktig, men ikke så viktig', '');
      typeNewHtmlTranslationInput(1, 'Kan utsettes', '');
      typeNewHtmlTranslationInput(1, 'Trengs egentlig ikke å gjøres', '');
      cy.findByRole('button', { name: 'Lagre' }).click();
      cy.wait('@updateTranslations').then((interception) => {
        expect(interception.request.body.data.i18n[htmlWithExistingTranslation]).to.be.undefined;
      });
    });

    it('updates with the correct translation when switching between languages', () => {
      const headingWithExistingTranslation = 'Tekstblokk med mye formatering og eksisterende oversettelse';
      const headingWithoutTranslation = 'Tekstblokk med mye formatering og manglende oversettelse';
      cy.findByRole('heading', { name: 'Oversettelser på Norsk nynorsk' }).should('exist');
      cy.findByRole('textbox', { name: headingWithExistingTranslation }).should(
        'have.value',
        'Tekstblokk med mye formatering og eksisterende oversettelse',
      );
      typeNewHtmlTranslationInput(2, headingWithoutTranslation, 'Nynorsk tekst');
      cy.findByRole('textbox', { name: headingWithoutTranslation }).should('have.value', 'Nynorsk tekst');
      cy.findByRole('textbox', { name: 'Søker' }).should('have.value', 'Søkar');
      cy.findByRole('button', { name: 'Norsk nynorsk' }).click();
      cy.findByRole('link', { name: 'Engelsk' }).click();
      cy.findByRole('textbox', { name: headingWithExistingTranslation }).should(
        'have.value',
        'Textblock with existing translation',
      );
      cy.findByRole('textbox', { name: headingWithoutTranslation }).should('have.value', '');
      cy.findByRole('textbox', { name: 'Søker' }).should('have.value', '');
      cy.findByRole('button', { name: 'Engelsk' }).click();
      cy.findByRole('link', { name: 'Norsk nynorsk' }).click();
      cy.findByRole('textbox', { name: headingWithExistingTranslation }).should(
        'have.value',
        'Tekstblokk med mye formatering og eksisterende oversettelse',
      );
      cy.findByRole('textbox', { name: 'Søker' }).should('have.value', 'Søkar');
    });
  });
});
