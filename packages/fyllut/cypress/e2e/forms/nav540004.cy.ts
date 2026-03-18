const selectRadio = (groupName: RegExp, answer: RegExp) => {
  cy.findByRole('group', { name: groupName }).within(() => {
    cy.findByRole('radio', { name: answer }).check({ force: true });
  });
};

const visitFixtureComponentsForm = (fixture: string) => {
  const baseUrl = Cypress.config('baseUrl') ?? '';
  const path = baseUrl.endsWith('/fyllut') ? `${baseUrl}/components?sub=paper` : '/fyllut/components?sub=paper';

  cy.visitFixtureForm('components', { fixture, path, startOnFirstStep: false });
};

const advanceToQuestion = (attempts = 0) => {
  cy.get('body').then(($body) => {
    if ($body.text().match(/Hvilken part er du i saken/i)) {
      return;
    }

    const checkbox = $body.find('input[type="checkbox"]');
    if (checkbox.length > 0) {
      cy.wrap(checkbox[0]).check({ force: true });
    }

    if (attempts >= 2) {
      throw new Error('Did not reach the first question for NAV 54-00.04');
    }

    cy.clickNextStep();
    advanceToQuestion(attempts + 1);
  });
};

const selectVisibleAttachmentChoices = () => {
  cy.get('body').then(($body) => {
    if (!$body.text().includes('Jeg legger det ved dette skjemaet')) {
      return;
    }

    cy.findAllByRole('radio', { name: /Jeg legger det ved dette skjemaet/i }).each(($radio) => {
      cy.wrap($radio).check({ force: true });
    });
  });
};

describe('NAV 54-00.04 - Svar i sak om barnebidrag', () => {
  it('keeps single-child conditional answers aligned with the summary page', () => {
    visitFixtureComponentsForm('forms/nav540004.json');

    advanceToQuestion();

    // partISaken
    selectRadio(/Hvilken part er du i saken/i, /Bidragspliktig/i);
    cy.clickNextStep();

    // dineOpplysninger
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Petter');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Pliktig');
    selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    // omDenSomHarSokt
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Mia');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Mottaker');
    cy.clickNextStep();

    // barnSoknadenGjelderFor – single child (ettBarn container becomes visible)
    // For bidragspliktig: no borBarnetINorge or harDuTilsynsordningForBarnet (those are bidragsmottaker only)
    selectRadio(/Er det søkt for ett eller flere barn/i, /ett barn/i);
    cy.findByRole('textbox', { name: /Barnets fornavn/i }).type('Nora');
    cy.findByRole('textbox', { name: /Barnets etternavn/i }).type('Eksempel');
    cy.findByRole('textbox', { name: /Barnets fødselsdato/i }).type('01.03.2015');
    selectRadio(/Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon/i, /^Nei$/i);
    cy.clickNextStep();

    // soknadenGjelder – sokerForKunEttBarn container is visible for single-child path
    selectRadio(/Hva har den andre parten søkt om/i, /Fastsettelse av barnebidrag/i);
    selectRadio(/Har den andre parten søkt tilbake i tid/i, /^Ja$/i);
    // customConditional branch: harDuBidrattTil... shown for bidragspliktig + fastsettelse + tilbakeITid
    selectRadio(/Har du bidratt til å forsørge barnet økonomisk i perioden det er søkt tilbake i tid/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Beskriv hva du har betalt, og for hvilke perioder det gjelder/i }).type(
      'Jeg har bidratt med faste utgifter i perioden.',
    );
    cy.clickNextStep();

    // barnsBostedOgSamvaer – single child fields (no flereBarnISammeSoknad container)
    selectRadio(/Har barnet delt fast bosted/i, /^Nei$/i);
    selectRadio(/Er det avtalt eller fastsatt at du skal ha samvær med barnet/i, /^Ja$/i);
    selectRadio(/Samværet er avtalt eller fastsatt ved/i, /skriftlig avtale/i);
    selectRadio(/Har Nav mottatt samværsavtalen tidligere i denne saken/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/i }).type('01.01.2024');
    cy.findByRole('spinbutton', { name: /Oppgi antall overnattinger over en 14 dagers periode/i }).type('4');
    // Nei hides the samvaerIFerier panel entirely
    selectRadio(/Har du samvær med barnet i ferier/i, /^Nei$/i);
    selectRadio(/Gjennomføres samværet slik det er avtalt/i, /^Ja$/i);
    cy.clickNextStep();

    // boforholdOgAndreEgneBarn (visible for bidragspliktig; samlivsbrudd is hidden for bidragspliktig)
    selectRadio(/Du og den andre partens boforhold/i, /Vi har flyttet fra hverandre/i);
    cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/i }).type('15.05.2021');
    selectRadio(/Bor du sammen med voksne over 18 år/i, /^Nei$/i);
    selectRadio(/Har du andre egne barn under 18 år som bor fast hos deg/i, /^Nei$/i);
    selectRadio(/Betaler du barnebidrag for andre egne barn/i, /^Nei$/i);
    cy.clickNextStep();

    // navaerendeBidrag – no existing agreement, so sub-fields are hidden
    selectRadio(/Har du en avtale om barnebidrag for det barnet det er søkt for/i, /^Nei$/i);
    cy.clickNextStep();

    // dinJobb
    selectRadio(/Er du i jobb/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Beskriv hva som er grunnen til at du ikke er i jobb/i }).type(
      'Jeg er under omstilling.',
    );
    cy.clickNextStep();

    // dinInntekt
    selectRadio(/Har du skattepliktig inntekt i Norge/i, /Nei, jeg har ikke skattepliktig inntekt/i);
    cy.findByRole('textbox', { name: /Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt/i }).type(
      'Jeg har ingen skattepliktig inntekt i søknadsperioden.',
    );
    cy.clickNextStep();

    // vedlegg
    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText('Nora Eksempel').should('exist');
    // customConditional verified: harDuBidrattTil... shown for bidragspliktig + tilbakeITid
    cy.findByText(/Har du bidratt til å forsørge barnet økonomisk i perioden det er søkt tilbake i tid/i).should(
      'exist',
    );
    // single-child path verified: samvær question appears in summary
    cy.findByText(/Har du samvær med barnet i ferier/i).should('exist');
  });
});
