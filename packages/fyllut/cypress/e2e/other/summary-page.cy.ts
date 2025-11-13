describe('SummaryPage', () => {
  before(() => {
    cy.configMocksServer();
  });

  beforeEach(() => {
    cy.defaultIntercepts();
    cy.mocksRestoreRouteVariants();
  });

  it('All values', () => {
    cy.visit('/fyllut/components?sub=paper');
    cy.defaultWaits();
    cy.clickShowAllSteps();

    const date = '20.10.2025';

    cy.clickIntroPageConfirmation();
    cy.clickStart();
    cy.findByRole('group', { name: /Har du norsk fødselsnummer eller d-nummer/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).check();
    });
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
    cy.clickNextStep();

    cy.findByRole('heading', { name: 'Standard felter' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Tekstfelt/ }).type('Nav 1');
    cy.findByRole('textbox', { name: /Tekstområde/ }).type('Nav 2');
    cy.findByRole('textbox', { name: /Tall/ }).type('1');
    cy.findByRole('checkbox', { name: /Avkryssingsboks/ }).check();
    cy.findByRole('group', { name: /Flervalg/ }).within(() => {
      cy.findByRole('checkbox', { name: 'Ja' }).check();
    });
    // Select react
    cy.findByRole('combobox', { name: /Nedtrekksmeny \(navSelect\)/ }).type('{downArrow}{enter}');
    // Select formio (ChoiceJS)
    cy.findAllByRole('combobox').eq(1).click();
    cy.findAllByRole('combobox')
      .eq(1)
      .within(() => {
        cy.findByRole('option', { name: 'Ja' }).click();
      });
    // Select formio (HTML5)
    cy.findAllByRole('combobox').eq(2).select('0,50');
    cy.findByRole('group', { name: /Radiopanel/ }).within(() => {
      cy.findByRole('radio', { name: 'Ja' }).check();
    });

    cy.findByRole('link', { name: 'Person' }).click();
    cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/ }).type('20905995783');
    cy.findByRole('textbox', { name: /Fornavn/ }).type('Ola');
    cy.findByRole('textbox', { name: /Etternavn/ }).type('Nordmann');
    cy.findByRole('textbox', { name: /C\/O/ }).type('Annen person');
    cy.findAllByRole('textbox', { name: /Vegadresse/ })
      .eq(0)
      .type('Fyrstikkalléen 1');
    cy.findAllByRole('textbox', { name: /Postnummer/ })
      .eq(0)
      .type('0661');
    cy.findAllByRole('textbox', { name: /Poststed/ })
      .eq(0)
      .type('Oslo');
    cy.findByRole('textbox', { name: /Gyldig fra/ }).type(date);
    cy.findByRole('textbox', { name: /Gyldig til/ }).type(date);
    cy.findAllByRole('textbox', { name: /Vegadresse/ })
      .eq(1)
      .type('Fyrstikkalléen 2');
    cy.findAllByRole('textbox', { name: /Postnummer/ })
      .eq(1)
      .type('0662');
    cy.findAllByRole('textbox', { name: /Poststed/ })
      .eq(1)
      .type('Oslo2');
    cy.findByRole('combobox', { name: /Velg land/ }).type('Norg{downArrow}{enter}');
    cy.findByRole('textbox', { name: /E-post/ }).type('test@nav.no');
    cy.findByRole('textbox', { name: /Telefonnummer/ }).type('21070000');
    cy.findByRole('textbox', { name: /Statsborgerskap/ }).type('Norsk');

    cy.findByRole('link', { name: 'Penger og konto' }).click();
    cy.findByRole('heading', { name: 'Penger og konto' }).shouldBeVisible();
    cy.findAllByRole('textbox', { name: /Beløp/ }).eq(0).type('1000');
    cy.findAllByRole('combobox', { name: /Velg valuta/ })
      .eq(0)
      .type('{downArrow}{enter}');
    cy.findAllByRole('textbox', { name: /Beløp/ }).eq(1).type('2000');
    cy.findByRole('textbox', { name: /Kontonummer/ }).type('76586005479');
    cy.findByRole('textbox', { name: /IBAN/ }).type('NO8330001234567');
    cy.findAllByRole('combobox', { name: /Velg valuta/ })
      .eq(1)
      .type('{downArrow}{downArrow}{enter}');

    cy.findByRole('link', { name: 'Bedrift / organisasjon' }).click();
    cy.findByRole('heading', { name: 'Bedrift / organisasjon' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Organisasjonsnummer/ }).type('889640782');
    cy.findByRole('textbox', { name: /Arbeidsgiver/ }).type('Nav');

    cy.findByRole('link', { name: 'Dato og tid' }).click();
    cy.findByRole('heading', { name: 'Dato og tid' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Dato/ }).type('01.01.2025');
    cy.findByRole('textbox', { name: /Klokkeslett/ }).type('01:01');
    cy.findByRole('textbox', { name: /Månedsvelger/ }).type('01.2025');
    cy.findByRole('textbox', { name: /År/ }).type('2025');

    cy.findByRole('link', { name: 'Gruppering' }).click();
    cy.findByRole('heading', { name: 'Gruppering' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 1/ }).type('Skjema 1');
    cy.findByRole('textbox', { name: /Tekstfelt skjemagruppe 2/ }).type('Skjema 2a');
    cy.findAllByRole('button', { name: 'Legg til' }).eq(0).click();
    cy.findAllByRole('textbox', { name: /Tekstfelt skjemagruppe 2/ })
      .eq(1)
      .type('Skjema 2b');
    cy.findByRole('textbox', { name: /Tekstfelt repeterende data/ }).type('Repeat 1');
    cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
    cy.findAllByRole('button', { name: 'Legg til' }).eq(1).click();
    cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
      .eq(1)
      .type('Repeat 2');
    cy.findAllByRole('textbox', { name: /Tekstfelt repeterende data/ })
      .eq(2)
      .type('Repeat 3');

    cy.findByRole('link', { name: 'Andre' }).click();
    cy.findByRole('heading', { name: 'Andre' }).shouldBeVisible();
    cy.findByRole('checkbox', { name: /Jeg bekrefter/ }).check();

    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.findByRole('heading', { name: 'Vedlegg' }).shouldBeVisible();
    cy.findByRole('group', { name: /Vedlegg/ }).within(() => {
      cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
    });
    cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
      cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).check();
    });

    cy.findByRole('link', { name: 'Oppsummering' }).click();
    cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

    cy.findByRole('heading', { level: 2, name: 'Introduksjon' })
      .parent()
      .parent()
      .within(() => {
        cy.contains('Jeg bekrefter at jeg vil svare så riktig som jeg kan').should('exist');
        cy.contains('Ja').should('exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Dine opplysninger' })
      .parent()
      .parent()
      .within(() => {
        cy.contains('Fødselsnummer eller d-nummer').should('exist');
        cy.contains('209059 95783').should('exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Standard felter' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Tekstfelt');
        cy.get('dd').eq(0).should('contain.text', 'Nav 1');
        cy.get('dt').eq(1).should('contain.text', 'Tekstområde');
        cy.get('dd').eq(1).should('contain.text', 'Nav 2');
        cy.get('dt').eq(2).should('contain.text', 'Tall');
        cy.get('dd').eq(2).should('contain.text', '1');
        cy.get('dt').eq(3).should('contain.text', 'Avkryssingsboks');
        cy.get('dd').eq(3).should('contain.text', 'Ja');
        cy.get('dt').eq(4).should('contain.text', 'Flervalg');
        cy.get('dd').eq(4).should('contain.text', 'Ja');
        cy.get('dt').eq(5).should('contain.text', 'Nedtrekksmeny (navSelect)');
        cy.get('dd').eq(5).should('contain.text', 'Nei');
        cy.get('dt').eq(6).should('contain.text', 'Nedtrekksmeny (select)');
        cy.get('dd').eq(6).should('contain.text', 'Ja');
        cy.get('dt').eq(7).should('contain.text', 'Nedtrekksmeny (select HTML5)');
        cy.get('dd').eq(7).should('contain.text', '0,5');
        cy.get('dt').eq(8).should('contain.text', 'Radiopanel');
        cy.get('dd').eq(8).should('contain.text', 'Ja');

        cy.contains('Alert info').should('not.exist');
        cy.contains('Alert suksess').should('exist');
        cy.contains('Alert error').should('exist');
        cy.contains('HTML Blokk').should('exist');
        cy.contains('Les mer').should('not.exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Person' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Fødselsnummer eller d-nummer');
        cy.get('dd').eq(0).should('contain.text', '209059 95783');
        cy.get('dt').eq(1).should('contain.text', 'Fornavn');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
        cy.get('dt').eq(2).should('contain.text', 'Etternavn');
        cy.get('dd').eq(2).should('contain.text', 'Nordmann');
        cy.get('dt').eq(3).should('contain.text', 'Adresse');
        cy.get('dd').eq(3).should('contain.text', 'c/o Annen person, Fyrstikkalléen 1, 0661 Oslo');
        cy.get('dt').eq(4).should('contain.text', 'Gyldig fra');
        cy.get('dd').eq(4).should('contain.text', date);
        cy.get('dt').eq(5).should('contain.text', 'Gyldig til');
        cy.get('dd').eq(5).should('contain.text', date);
        cy.get('dt').eq(6).should('contain.text', 'Vegadresse');
        cy.get('dd').eq(6).should('contain.text', 'Fyrstikkalléen 2');
        cy.get('dt').eq(7).should('contain.text', 'Postnummer');
        cy.get('dd').eq(7).should('contain.text', '0662');
        cy.get('dt').eq(8).should('contain.text', 'Poststed');
        cy.get('dd').eq(8).should('contain.text', 'Oslo2');
        cy.get('dt').eq(9).should('contain.text', 'Velg land');
        cy.get('dd').eq(9).should('contain.text', 'Norge');
        cy.get('dt').eq(10).should('contain.text', 'E-post');
        cy.get('dd').eq(10).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(11).should('contain.text', 'Telefonnummer');
        cy.get('dd').eq(11).should('contain.text', '+47 21 07 00 00');
        cy.get('dt').eq(12).should('contain.text', 'Statsborgerskap');
        cy.get('dd').eq(12).should('contain.text', 'Norsk');
      });

    cy.findByRole('heading', { level: 2, name: 'Penger og konto' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Beløp');
        cy.get('dd').eq(0).should('contain.text', '1\u00a0000,00\u00a0NOK');
        cy.get('dt').eq(1).should('contain.text', 'Velg valuta');
        cy.get('dd').eq(1).should('contain.text', 'Norsk krone (NOK)');
        cy.get('dt').eq(2).should('contain.text', 'Beløp');
        cy.get('dd').eq(2).should('contain.text', '2\u00a0000');
        cy.get('dt').eq(3).should('contain.text', 'Kontonummer');
        cy.get('dd').eq(3).should('contain.text', '7658 60 05479');
        cy.get('dt').eq(4).should('contain.text', 'IBAN');
        cy.get('dd').eq(4).should('contain.text', 'NO83 3000 1234 567');
        cy.get('dt').eq(5).should('contain.text', 'Velg valuta');
        cy.get('dd').eq(5).should('contain.text', 'Svensk krone (SEK)');
      });

    cy.findByRole('heading', { level: 2, name: 'Bedrift / organisasjon' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Organisasjonsnummer');
        cy.get('dd').eq(0).should('contain.text', '889 640 782');
        cy.get('dt').eq(1).should('contain.text', 'Arbeidsgiver');
        cy.get('dd').eq(1).should('contain.text', 'Nav');
      });

    cy.findByRole('heading', { level: 2, name: 'Dato og tid' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Dato');
        cy.get('dd').eq(0).should('contain.text', '01.01.2025');
        cy.get('dt').eq(1).should('contain.text', 'Klokkeslett');
        cy.get('dd').eq(1).should('contain.text', '01:01');
        cy.get('dt').eq(2).should('contain.text', 'Månedsvelger');
        cy.get('dd').eq(2).should('contain.text', 'Januar 2025');
        cy.get('dt').eq(3).should('contain.text', 'År');
        cy.get('dd').eq(3).should('contain.text', '2025');
      });

    cy.findByRole('heading', { level: 2, name: 'Gruppering' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Skjemagruppe 1');
        cy.get('dd')
          .eq(0)
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Tekstfelt skjemagruppe 1');
            cy.get('dd').eq(0).should('contain.text', 'Skjema 1');
            cy.get('dt').eq(1).should('contain.text', 'Skjemagruppe 2');
            cy.get('dd')
              .eq(1)
              .within(() => {
                cy.get('dt').eq(0).should('contain.text', 'Tekstfelt skjemagruppe 2');
                cy.get('dd').eq(0).should('contain.text', 'Skjema 2a');
                cy.get('dt').eq(1).should('contain.text', 'Tekstfelt skjemagruppe 2');
                cy.get('dd').eq(1).should('contain.text', 'Skjema 2b');
              });
          });
        cy.get('dt').eq(5).should('contain.text', 'Repeterende data');
        cy.get('dd')
          .eq(5)
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Tekstfelt repeterende data');
            cy.get('dd').eq(0).should('contain.text', 'Repeat 1');
            cy.get('dt').eq(1).should('contain.text', 'Tekstfelt repeterende data');
            cy.get('dd').eq(1).should('contain.text', 'Repeat 2');
            cy.get('dt').eq(2).should('contain.text', 'Tekstfelt repeterende data');
            cy.get('dd').eq(2).should('contain.text', 'Repeat 3');
          });
      });

    cy.findByRole('heading', { level: 2, name: 'Andre' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Jeg bekrefter at jeg vil svare så riktig som jeg kan.');
        cy.get('dd').eq(0).should('contain.text', 'Ja');
      });

    cy.findByRole('heading', { level: 2, name: 'Vedlegg' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Vedlegg');
        cy.get('dd').eq(0).should('contain.text', 'Jeg ettersender dokumentasjonen senere');
        cy.get('dt').eq(1).should('contain.text', 'Annen dokumentasjon');
        cy.get('dd').eq(1).should('contain.text', 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved');
      });
  });

  it('All values (en)', () => {
    cy.visit('/fyllut/components?sub=paper&lang=en');
    cy.defaultWaits();
    cy.clickShowAllSteps();

    const date = '20.10.2025';

    cy.findByRoleWhenAttached('checkbox', { name: /I confirm that I will answer as accurately as I can/ }).click();
    cy.clickNextStep();
    cy.findByRole('group', { name: /Do you have a Norwegian national identification number or d number?/ }).within(
      () => {
        cy.findByRole('radio', { name: 'Yes' }).check();
      },
    );
    cy.findByRole('textbox', { name: /Norwegian national identification number or D number/ }).type('20905995783');
    cy.clickNextStep();

    cy.findByRole('heading', { name: 'Standard fields' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Text field/ }).type('Nav 1');
    cy.findByRole('textbox', { name: /Text area/ }).type('Nav 2');
    cy.findByRole('textbox', { name: /Number/ }).type('1');
    cy.findByRole('checkbox', { name: /Checkbox/ }).check();
    cy.findByRole('group', { name: /Multiple choice/ }).within(() => {
      cy.findByRole('checkbox', { name: 'Yes' }).check();
    });
    // Select react
    cy.findByRole('combobox', { name: /Dropdown \(navSelect\)/ }).type('{downArrow}{enter}');
    // Select formio (ChoiceJS)
    cy.findAllByRole('combobox').eq(1).click();
    cy.findAllByRole('combobox')
      .eq(1)
      .within(() => {
        cy.findByRole('option', { name: 'Yes' }).click();
      });
    // Select formio (HTML5)
    cy.findAllByRole('combobox').eq(2).select('0.50');
    cy.findByRole('group', { name: /Radio panel/ }).within(() => {
      cy.findByRole('radio', { name: 'Yes' }).check();
    });

    cy.findByRole('link', { name: 'Person' }).click();
    cy.findByRole('heading', { name: 'Person' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Norwegian national identification number or D number/ }).type('20905995783');
    cy.findByRole('textbox', { name: /First name/ }).type('Ola');
    cy.findByRole('textbox', { name: /Last name/ }).type('Nordmann');
    cy.findByRole('textbox', { name: /C\/O/ }).type('Other person');
    cy.findAllByRole('textbox', { name: /Street address/ })
      .eq(0)
      .type('Fyrstikkalléen 1');
    cy.findAllByRole('textbox', { name: /Postal code/ })
      .eq(0)
      .type('0661');
    cy.findAllByRole('textbox', { name: /City/ }).eq(0).type('Oslo');
    cy.findByRole('textbox', { name: /Valid from/ }).type(date);
    cy.findByRole('textbox', { name: /Valid to/ }).type(date);
    cy.findAllByRole('textbox', { name: /Street address/ })
      .eq(1)
      .type('Fyrstikkalléen 2');
    cy.findAllByRole('textbox', { name: /Postal code/ })
      .eq(1)
      .type('0662');
    cy.findAllByRole('textbox', { name: /City/ }).eq(1).type('Oslo2');
    cy.findByRole('combobox', { name: /Select country/ }).type('Norw{downArrow}{enter}');
    cy.findByRole('textbox', { name: /E-mail/ }).type('test@nav.no');
    cy.findByRole('textbox', { name: /Telephone number/ }).type('21070000');
    cy.findByRole('textbox', { name: /Citizenship/ }).type('Norwegian');

    cy.findByRole('link', { name: 'Money and account' }).click();
    cy.findByRole('heading', { name: 'Money and account' }).shouldBeVisible();
    cy.findAllByRole('textbox', { name: /Amount/ })
      .eq(0)
      .type('1000');
    cy.findAllByRole('combobox', { name: /Select currency/ })
      .eq(0)
      .type('{downArrow}{enter}');
    cy.findAllByRole('textbox', { name: /Amount/ })
      .eq(1)
      .type('2000');
    cy.findByRole('textbox', { name: /Account number/ }).type('76586005479');
    cy.findByRole('textbox', { name: /IBAN/ }).type('NO8330001234567');
    cy.findAllByRole('combobox', { name: /Select currency/ })
      .eq(1)
      .type('{downArrow}{downArrow}{enter}');

    cy.findByRole('link', { name: 'Company / organization' }).click();
    cy.findByRole('heading', { name: 'Company / organization' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Organisation number / }).type('889640782');
    cy.findByRole('textbox', { name: /Employer/ }).type('Nav');

    cy.findByRole('link', { name: 'Date and time' }).click();
    cy.findByRole('heading', { name: 'Date and time' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Date/ }).type('01.01.2025');
    cy.findByRole('textbox', { name: /Time/ }).type('01:01');
    cy.findByRole('textbox', { name: /Month picker/ }).type('01.2025');
    cy.findByRole('textbox', { name: /Year/ }).type('2025');

    cy.findByRole('link', { name: 'Grouping' }).click();
    cy.findByRole('heading', { name: 'Grouping' }).shouldBeVisible();
    cy.findByRole('textbox', { name: /Text field form group 1/ }).type('Form 1');
    cy.findByRole('textbox', { name: /Text field form group 2/ }).type('Form 2a');
    cy.findAllByRole('button', { name: 'Add' }).eq(0).click();
    cy.findAllByRole('textbox', { name: /Text field form group 2/ })
      .eq(1)
      .type('Form 2b');
    cy.findByRole('textbox', { name: /Text field repeating data/ }).type('Repeat 1');
    cy.findAllByRole('button', { name: 'Add' }).eq(1).click();
    cy.findAllByRole('button', { name: 'Add' }).eq(1).click();
    cy.findAllByRole('textbox', { name: /Text field repeating data/ })
      .eq(1)
      .type('Repeat 2');
    cy.findAllByRole('textbox', { name: /Text field repeating data/ })
      .eq(2)
      .type('Repeat 3');

    cy.findByRole('link', { name: 'Other' }).click();
    cy.findByRole('heading', { name: 'Other' }).shouldBeVisible();
    cy.findByRole('checkbox', { name: /I confirm/ }).check();

    cy.findByRole('link', { name: 'Attachments' }).click();
    cy.findByRole('heading', { name: 'Attachments' }).shouldBeVisible();
    cy.findByRole('group', { name: /Attachments/ }).within(() => {
      cy.findByRole('radio', { name: 'I will forward the documentation later' }).check();
    });
    cy.findByRole('group', { name: /Other documentation/ }).within(() => {
      cy.findByRole('radio', { name: 'No, I have no additional documentation to attach' }).check();
    });

    cy.findByRole('link', { name: 'Summary' }).click();
    cy.findByRole('heading', { name: 'Summary' }).shouldBeVisible();

    cy.findByRole('heading', { level: 2, name: 'Introduction' })
      .parent()
      .parent()
      .within(() => {
        cy.contains('I confirm that I will answer as accurately as I can').should('exist');
        cy.contains('Yes').should('exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Your personal information' })
      .parent()
      .parent()
      .within(() => {
        cy.contains('Norwegian national identification number or D number').should('exist');
        cy.contains('209059 95783').should('exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Standard fields' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Text field');
        cy.get('dd').eq(0).should('contain.text', 'Nav 1');
        cy.get('dt').eq(1).should('contain.text', 'Text area');
        cy.get('dd').eq(1).should('contain.text', 'Nav 2');
        cy.get('dt').eq(2).should('contain.text', 'Number');
        cy.get('dd').eq(2).should('contain.text', '1');
        cy.get('dt').eq(3).should('contain.text', 'Checkbox');
        cy.get('dd').eq(3).should('contain.text', 'Yes');
        cy.get('dt').eq(4).should('contain.text', 'Multiple choice');
        cy.get('dd').eq(4).should('contain.text', 'Yes');
        cy.get('dt').eq(5).should('contain.text', 'Dropdown (navSelect)');
        cy.get('dd').eq(5).should('contain.text', 'No');
        cy.get('dt').eq(6).should('contain.text', 'Dropdown (select)');
        cy.get('dd').eq(6).should('contain.text', 'Yes');
        cy.get('dt').eq(7).should('contain.text', 'Dropdown (select HTML5)');
        cy.get('dd').eq(7).should('contain.text', '0,5');
        cy.get('dt').eq(8).should('contain.text', 'Radio panel');
        cy.get('dd').eq(8).should('contain.text', 'Yes');

        cy.contains('Alert info').should('not.exist');
        cy.contains('Alert success').should('exist');
        cy.contains('Alert error').should('exist');
        cy.contains('HTML Block').should('exist');
        cy.contains('Read more').should('not.exist');
      });

    cy.findByRole('heading', { level: 2, name: 'Person' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Norwegian national identification number or D number');
        cy.get('dd').eq(0).should('contain.text', '209059 95783');
        cy.get('dt').eq(1).should('contain.text', 'First name');
        cy.get('dd').eq(1).should('contain.text', 'Ola');
        cy.get('dt').eq(2).should('contain.text', 'Last name');
        cy.get('dd').eq(2).should('contain.text', 'Nordmann');
        cy.get('dt').eq(3).should('contain.text', 'Address');
        cy.get('dd').eq(3).should('contain.text', 'c/o Other person, Fyrstikkalléen 1, 0661 Oslo');
        cy.get('dt').eq(4).should('contain.text', 'Valid from');
        cy.get('dd').eq(4).should('contain.text', date);
        cy.get('dt').eq(5).should('contain.text', 'Valid to');
        cy.get('dd').eq(5).should('contain.text', date);
        cy.get('dt').eq(6).should('contain.text', 'Street address');
        cy.get('dd').eq(6).should('contain.text', 'Fyrstikkalléen 2');
        cy.get('dt').eq(7).should('contain.text', 'Postal code');
        cy.get('dd').eq(7).should('contain.text', '0662');
        cy.get('dt').eq(8).should('contain.text', 'City');
        cy.get('dd').eq(8).should('contain.text', 'Oslo2');
        cy.get('dt').eq(9).should('contain.text', 'Select country');
        cy.get('dd').eq(9).should('contain.text', 'Norway');
        cy.get('dt').eq(10).should('contain.text', 'E-mail');
        cy.get('dd').eq(10).should('contain.text', 'test@nav.no');
        cy.get('dt').eq(11).should('contain.text', 'Telephone number');
        cy.get('dd').eq(11).should('contain.text', '+47 21 07 00 00');
        cy.get('dt').eq(12).should('contain.text', 'Citizenship');
        cy.get('dd').eq(12).should('contain.text', 'Norwegian');
      });

    cy.findByRole('heading', { level: 2, name: 'Money and account' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Amount');
        cy.get('dd').eq(0).should('contain.text', '1\u00a0000,00\u00a0NOK');
        cy.get('dt').eq(1).should('contain.text', 'Select currency');
        cy.get('dd').eq(1).should('contain.text', 'Norwegian krone (NOK)');
        cy.get('dt').eq(2).should('contain.text', 'Amount');
        cy.get('dd').eq(2).should('contain.text', '2\u00a0000');
        cy.get('dt').eq(3).should('contain.text', 'Account number');
        cy.get('dd').eq(3).should('contain.text', '7658 60 05479');
        cy.get('dt').eq(4).should('contain.text', 'IBAN');
        cy.get('dd').eq(4).should('contain.text', 'NO83 3000 1234 567');
        cy.get('dt').eq(5).should('contain.text', 'Select currency');
        cy.get('dd').eq(5).should('contain.text', 'Swedish krona (SEK)');
      });

    cy.findByRole('heading', { level: 2, name: 'Company / organization' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Organisation number');
        cy.get('dd').eq(0).should('contain.text', '889 640 782');
        cy.get('dt').eq(1).should('contain.text', 'Employer');
        cy.get('dd').eq(1).should('contain.text', 'Nav');
      });

    cy.findByRole('heading', { level: 2, name: 'Date and time' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Date');
        cy.get('dd').eq(0).should('contain.text', '01.01.2025');
        cy.get('dt').eq(1).should('contain.text', 'Time');
        cy.get('dd').eq(1).should('contain.text', '01:01');
        cy.get('dt').eq(2).should('contain.text', 'Month picker');
        cy.get('dd').eq(2).should('contain.text', 'January 2025');
        cy.get('dt').eq(3).should('contain.text', 'Year');
        cy.get('dd').eq(3).should('contain.text', '2025');
      });

    cy.findByRole('heading', { level: 2, name: 'Grouping' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Form group 1');
        cy.get('dd')
          .eq(0)
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Text field form group 1');
            cy.get('dd').eq(0).should('contain.text', 'Form 1');
            cy.get('dt').eq(1).should('contain.text', 'Form group 2');
            cy.get('dd')
              .eq(1)
              .within(() => {
                cy.get('dt').eq(0).should('contain.text', 'Text field form group 2');
                cy.get('dd').eq(0).should('contain.text', 'Form 2a');
                cy.get('dt').eq(1).should('contain.text', 'Text field form group 2');
                cy.get('dd').eq(1).should('contain.text', 'Form 2b');
              });
          });
        cy.get('dt').eq(5).should('contain.text', 'Repeating data');
        cy.get('dd')
          .eq(5)
          .within(() => {
            cy.get('dt').eq(0).should('contain.text', 'Text field repeating data');
            cy.get('dd').eq(0).should('contain.text', 'Repeat 1');
            cy.get('dt').eq(1).should('contain.text', 'Text field repeating data');
            cy.get('dd').eq(1).should('contain.text', 'Repeat 2');
            cy.get('dt').eq(2).should('contain.text', 'Text field repeating data');
            cy.get('dd').eq(2).should('contain.text', 'Repeat 3');
          });
      });

    cy.findByRole('heading', { level: 2, name: 'Other' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'I confirm that I will answer as correctly as I can.');
        cy.get('dd').eq(0).should('contain.text', 'Yes');
      });

    cy.findByRole('heading', { level: 2, name: 'Attachments' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Attachments');
        cy.get('dd').eq(0).should('contain.text', 'I will forward the documentation later');
        cy.get('dt').eq(1).should('contain.text', 'Other documentation');
        cy.get('dd').eq(1).should('contain.text', 'No, I have no additional documentation to attach');
      });
  });

  it('Digital no login, some components', () => {
    cy.visit('/fyllut/components/legitimasjon?sub=digitalnologin');
    cy.findByRole('group', { name: 'Hvilken legitimasjon ønsker du å bruke?' }).within(() =>
      cy.findByLabelText('Norsk pass').check(),
    );
    cy.get('input[type=file]').selectFile('cypress/fixtures/files/id-billy-bruker.jpg', { force: true });
    cy.clickNextStep();

    cy.defaultWaits();
    cy.clickShowAllSteps();

    cy.findByRole('link', { name: 'Vedlegg' }).click();
    cy.findByRole('heading', { name: 'Vedlegg' }).shouldBeVisible();
    cy.findByRole('group', { name: /Vedlegg/ }).within(() => {
      cy.findByRole('radio', { name: 'Jeg ettersender dokumentasjonen senere' }).check();
    });
    cy.findByRole('group', { name: /Annen dokumentasjon/ }).within(() => {
      cy.findByRole('radio', { name: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved' }).check();
    });

    cy.findByRole('link', { name: 'Oppsummering' }).click();
    cy.findByRole('heading', { name: 'Oppsummering' }).shouldBeVisible();

    cy.findByRole('heading', { level: 2, name: 'Vedlegg' })
      .parent()
      .parent()
      .within(() => {
        cy.get('dt').eq(0).should('contain.text', 'Vedlegg');
        cy.get('dd').eq(0).should('contain.text', 'Jeg ettersender dokumentasjonen senere');
        cy.get('dt').eq(1).should('contain.text', 'Annen dokumentasjon');
        cy.get('dd').eq(1).should('contain.text', 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved');
      });
  });
});
