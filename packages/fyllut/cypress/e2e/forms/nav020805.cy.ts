describe('NAV 02-08.05 - Søknad om medlemskap i folketrygden under opphold utenfor EØS', () => {
  beforeEach(() => {
    cy.intercept('POST', '/fyllut/api/log*', { body: 'ok' }).as('logger');
    cy.intercept('GET', '/fyllut/api/config*', { body: {} }).as('getConfig');
    cy.intercept('GET', '/fyllut/api/global-translations/*', { body: {} }).as('getGlobalTranslations');
    cy.intercept('GET', '/fyllut/api/common-codes/currencies*', { body: [] }).as('getCurrencies');
    cy.intercept('GET', '/fyllut/api/common-codes/area-codes', { body: [] }).as('getAreaCodes');
    cy.intercept('GET', '/fyllut/api/translations/nav020805*', { body: {} }).as('getTranslations');
    cy.intercept('GET', '/fyllut/api/forms/nav020805*', { fixture: 'forms/nav020805.json' }).as('getForm');
    cy.visit('/fyllut/nav020805?sub=paper');
    cy.wait('@getForm');
    cy.clickStart();
  });

  describe('Flow 1: Søker selv, ikke arbeide - hvaErDinSituasjonIPerioden.jegStuderer=true', () => {
    it('should show student situation when fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv=nei and skalDuArbeideEllerDriveNaeringIUtlandet=nei', () => {
      // Fyller du ut søknaden på vegne av andre enn deg selv? Nei
      cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
      cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
      cy.clickNextStep();

      // Opplysninger om søknaden
      cy.findByRole('combobox', { name: /Hvilket land/i }).type('USA{enter}');
      cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');

      // Har du oppholdt deg i utlandet de siste fem årene?
      cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      // Hvilken trygdedekning søker du om?
      cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
        cy.findByRole('radio', { name: /Helsedelen/i }).check();
      });

      // Wait for conditional question to appear

      // Søker du i tillegg om rett til sykepenger og foreldrepenger? (conditional)
      cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('radio', { name: /^Nei$/i }).check();
        });

      cy.clickNextStep();

      // Opplysninger om utenlandsoppholdet
      // Skal du arbeide eller drive næring i utlandet?
      cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      // Wait for conditional field

      // Hva er situasjonen din i perioden? (required when not working)
      cy.findByRole('group', { name: /Hva er situasjonen din i perioden/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('checkbox', { name: /Jeg studerer/i }).check();
        });

      cy.clickNextStep();

      // Should now be on student panel
      cy.findByRole('heading', { level: 2, name: /Student/i }).should('exist');
    });
  });

  describe('Flow 2: Søker på vegne av andre med fullmakt', () => {
    it('should show fullmakt fields when fyllerDuUtSoknadenPaVegneAvAndreEnnDegSelv=ja and hvorforSokerDuPaVegneAvEnAnnenPerson=jegHarFullmakt', () => {
      // Fyller du ut søknaden på vegne av andre enn deg selv? Ja
      cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.clickNextStep();

      // Fullmakt panel should appear
      cy.findByRole('heading', { level: 2, name: /Fullmakt/i }).should('exist');

      // Hvorfor søker du på vegne av en annen person?
      cy.findByRole('group', { name: /Hvorfor søker.*vegne av.*person/i }).within(() => {
        cy.findByRole('radio', { name: /^Jeg har fullmakt$/i }).check();
      });

      cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Fullmaktfornavn');
      cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Fullmaktetternavn');
      cy.clickNextStep();

      // Dine opplysninger
      cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
      cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
      cy.clickNextStep();

      // Opplysninger om søknaden
      cy.findByRole('combobox', { name: /Hvilket land/i }).type('USA{enter}');
      cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');

      cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
        cy.findByRole('radio', { name: /Helsedelen/i }).check();
      });

      cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('radio', { name: /^Nei$/i }).check();
        });

      cy.clickNextStep();

      // Opplysninger om utenlandsoppholdet
      cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      cy.findByRole('group', { name: /Hva er situasjonen din i perioden/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('checkbox', { name: /Jeg studerer/i }).check();
        });

      cy.clickNextStep();

      // Verify we moved forward (should be on Student panel if following the student path)
      cy.findByRole('heading', { level: 2, name: /Student/i }).should('exist');
    });
  });

  describe('Flow 3: Arbeide i utlandet som lønnsmottaker', () => {
    it('should show work-related panels when skalDuArbeideEllerDriveNaeringIUtlandet=ja and hvaErDinArbeidssituasjonIPerioden1.lonnsmottaker=true', () => {
      cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
      cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
      cy.clickNextStep();

      cy.findByRole('combobox', { name: /Hvilket land/i }).type('USA{enter}');
      cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');

      cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
        cy.findByRole('radio', { name: /Helsedelen/i }).check();
      });

      cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('radio', { name: /^Nei$/i }).check();
        });

      cy.clickNextStep();

      // Opplysninger om utenlandsoppholdet
      // Skal du arbeide eller drive næring i utlandet? JA
      cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });

      // Wait for conditional fields to appear

      // Hva er arbeidssituasjonen din? - Select Lønnsmottaker
      cy.findByRole('group', { name: /Hva er.*arbeidssituasjonen din/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('checkbox', { name: /Lønnsmottaker/i }).check();
        });

      // Hvilken stilling har du? (required field)
      cy.findByRole('textbox', { name: /Hvilken stilling har du/i }).type('Utvikler');

      cy.clickNextStep();

      // Should now show "Lønnsmottaker" panel (customConditional triggers based on checkbox)
      cy.findByRole('heading', { level: 2, name: /Lønnsmottaker/i }).should('exist');
    });
  });

  describe('Flow 4: Arbeide i utlandet som selvstendig næringsdrivende', () => {
    it('should show næringsdrivende panel when skalDuArbeideEllerDriveNaeringIUtlandet=ja and hvaErDinArbeidssituasjonIPerioden1.selvstendigNaeringsdrivende=true', () => {
      cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
      cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
      cy.clickNextStep();

      cy.findByRole('combobox', { name: /Hvilket land/i }).type('USA{enter}');
      cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');

      cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
        cy.findByRole('radio', { name: /Helsedelen/i }).check();
      });

      cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('radio', { name: /^Nei$/i }).check();
        });

      cy.clickNextStep();

      cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });

      // Select Selvstendig næringsdrivende
      cy.findByRole('group', { name: /Hva er.*arbeidssituasjonen din/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('checkbox', { name: /Selvstendig næringsdrivende/i }).check();
        });

      // Hvilken stilling har du? (required field)
      cy.findByRole('textbox', { name: /Hvilken stilling har du/i }).type('Næringsdrivende');

      cy.clickNextStep();

      // Should show "Selvstendig næringsdrivende" panel
      cy.findByRole('heading', { level: 2, name: /Selvstendig næringsdrivende/i }).should('exist');
    });
  });

  describe('Flow 5: Ikke arbeide - følger med familiemedlem', () => {
    it('should skip work panels when skalDuArbeideEllerDriveNaeringIUtlandet=nei and hvaErDinSituasjonIPerioden.jegFolgerMedEtFamiliemedlem=true', () => {
      cy.findByRole('group', { name: /Fyller du ut.*søknaden.*vegne av andre/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });
      cy.clickNextStep();

      cy.findByRole('textbox', { name: /Fornavn/i }).type('Ola');
      cy.findByRole('textbox', { name: /Etternavn/i }).type('Nordmann');
      cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/i }).within(() => {
        cy.findByRole('radio', { name: /^Ja$/i }).check();
      });
      cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
      cy.clickNextStep();

      cy.findByRole('combobox', { name: /Hvilket land/i }).type('USA{enter}');
      cy.findByRole('textbox', { name: /Fra dato/i }).type('01.01.2025');
      cy.findByRole('textbox', { name: /Til dato/i }).type('31.12.2025');

      cy.findByRole('group', { name: /Har du oppholdt deg i utlandet de siste fem årene/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      cy.findByRole('group', { name: /Hvilken.*trygdedekning.*søker du om/i }).within(() => {
        cy.findByRole('radio', { name: /Helsedelen/i }).check();
      });

      cy.findByRole('group', { name: /Søker du i tillegg.*sykepenger.*foreldrepenger/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('radio', { name: /^Nei$/i }).check();
        });

      cy.clickNextStep();

      // Skal du arbeide eller drive næring i utlandet? NEI
      cy.findByRole('group', { name: /Skal du arbeide eller drive næring i utlandet/i }).within(() => {
        cy.findByRole('radio', { name: /^Nei$/i }).check();
      });

      // Hva er situasjonen din i perioden? - Følger med familiemedlem
      cy.findByRole('group', { name: /Hva er situasjonen din i perioden/i })
        .should('be.visible')
        .within(() => {
          cy.findByRole('checkbox', { name: /Jeg følger med et familiemedlem/i }).check();
        });

      // Verify work situation question does NOT appear
      cy.findByRole('group', { name: /Hva er.*arbeidssituasjonen din/i }).should('not.exist');

      cy.clickNextStep();

      // Should skip work panels and move to "Følger med et familiemedlem" section
      cy.findByRole('heading', { level: 2, name: /Følger med et familiemedlem/i }).should('exist');
    });
  });
});
