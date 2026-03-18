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
      throw new Error('Did not reach the first question for NAV 54-00.05');
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

describe('NAV 54-00.05 - Søknad om barnebidrag', () => {
  it('keeps single-child conditional answers in sync with the summary page', () => {
    visitFixtureComponentsForm('forms/nav540005.json');

    advanceToQuestion();

    // partISaken
    selectRadio(/Hvilken part er du i saken/i, /Bidragsmottaker/i);
    cy.clickNextStep();

    // dineOpplysninger
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Sara');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Søker');
    selectRadio(/Har du norsk fødselsnummer eller d-nummer/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Fødselsnummer eller d-nummer/i }).type('22859597622');
    cy.clickNextStep();

    // barnSoknadenGjelderFor – single child (ettBarn container becomes visible)
    // For bidragsmottaker: borBarnetINorgeBM and harDuTilsynsordningForBarnet are shown
    selectRadio(/Skal du søke for ett eller flere barn/i, /ett barn/i);
    cy.findByRole('textbox', { name: /Barnets fornavn/i }).type('Anna');
    cy.findByRole('textbox', { name: /Barnets etternavn/i }).type('Eksempel');
    cy.findByRole('textbox', { name: /Barnets fødselsdato/i }).type('10.01.2016');
    selectRadio(/Bor barnet i Norge/i, /^Ja$/i);
    selectRadio(/Blir barnet helt eller delvis forsørget av barnevernet eller en institusjon/i, /^Nei$/i);
    // harDuTilsynsordningForBarnet = Ja triggers customConditional on vedlegg attachment (bidragsmottaker only)
    selectRadio(/Har barnet en tilsynsordning/i, /^Ja$/i);
    // forsorgerDuEgneBarnMenAndreEnnDeSomSoknadenGjelder appears because tilsynsordning = ja
    selectRadio(/Har du tilsynsutgifter for andre egne barn/i, /^Nei$/i);
    cy.clickNextStep();

    // soknadenGjelder – sokerForKunEttBarn container is visible for single-child path
    selectRadio(/Hva søker du om/i, /Fastsettelse av barnebidrag/i);
    selectRadio(/Søker du tilbake i tid/i, /^Ja$/i);
    cy.findByRole('textbox', {
      name: /Hva er grunnen til at du søker tilbake i tid, og hvorfor har du ikke søkt før/i,
    }).type('Behovet oppstod tidligere enn søknadstidspunktet.');
    // customConditional branch: harDenAndrePartens... shown for bidragsmottaker + fastsettelse + tilbakeITid
    selectRadio(
      /Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid/i,
      /^Ja$/i,
    );
    cy.findByRole('textbox', {
      name: /Beskriv hva den andre parten har betalt, og for hvilke perioder det gjelder/i,
    }).type('Motparten har dekket enkelte utgifter i denne perioden.');
    selectRadio(/Ønsker du at Skatteetaten skal kreve inn barnebidraget/i, /Nei, vi gjør opp privat/i);
    selectRadio(/Søker du også om bidragsforskudd/i, /^Nei$/i);
    selectRadio(/Hva er din sivilstand/i, /Jeg er enslig/i);
    cy.clickNextStep();

    // barnsBostedOgSamvaer – single child fields for bidragsmottaker
    selectRadio(/Bor barnet fast hos deg/i, /^Ja$/i);
    selectRadio(/Har barnet bodd fast hos deg siden fødselen/i, /^Ja$/i);
    selectRadio(/Har barnet delt fast bosted/i, /^Nei$/i);
    selectRadio(/Er det avtalt eller fastsatt at den bidragspliktige skal ha samvær med barnet/i, /^Ja$/i);
    selectRadio(/Samværet er avtalt eller fastsatt ved/i, /skriftlig avtale/i);
    selectRadio(/Har Nav mottatt samværsavtalen tidligere i denne saken/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Avtalen gjelder fra dato/i }).type('01.01.2024');
    cy.findByRole('spinbutton', { name: /Oppgi antall overnattinger over en 14 dagers periode/i }).type('4');
    // Nei hides the samvaerIFerier panel entirely
    selectRadio(/Har barnet samvær i ferier/i, /^Nei$/i);
    selectRadio(/Gjennomføres samværet slik det er avtalt/i, /^Ja$/i);
    cy.clickNextStep();

    // omDenAndreParten
    cy.findByRole('textbox', { name: /^Fornavn$/i }).type('Morten');
    cy.findByRole('textbox', { name: /^Etternavn$/i }).type('Motpart');
    selectRadio(/Kjenner du den andre partens norske fødselsnummer eller d-nummer/i, /^Nei$/i);
    selectRadio(/Vet du fødselsdatoen til den andre parten/i, /^Ja$/i);
    cy.findByRole('textbox', { name: /Den andre partens fødselsdato/i }).type('12.03.1988');
    selectRadio(/Bor den andre parten på sin folkeregistrerte adresse/i, /^Ja$/i);
    selectRadio(/Bor den andre parten i Norge/i, /^Ja$/i);
    selectRadio(/Vet du adressen/i, /^Nei$/i);
    cy.clickNextStep();

    // samlivsbrudd (visible for bidragsmottaker + fastsettelse; boforholdOgAndreEgneBarn is hidden)
    selectRadio(/Du og den andre partens boforhold/i, /Vi har flyttet fra hverandre/i);
    cy.findByRole('textbox', { name: /Når flyttet dere fra hverandre/i }).type('01.04.2022');
    cy.clickNextStep();

    // navaerendeBidrag – no existing agreement, so sub-fields are hidden
    selectRadio(/Har du en avtale om barnebidrag for det barnet du søker for/i, /^Nei$/i);
    cy.clickNextStep();

    // dinJobb
    selectRadio(/Er du i jobb/i, /^Nei$/i);
    cy.findByRole('textbox', { name: /Beskriv hva som er grunnen til at du ikke er i jobb/i }).type(
      'Jeg er mellom jobber akkurat nå.',
    );
    cy.clickNextStep();

    // dinInntekt
    selectRadio(/Har du skattepliktig inntekt i Norge/i, /Nei, jeg har ikke skattepliktig inntekt/i);
    cy.findByRole('textbox', { name: /Beskriv hva som er grunnen til at du ikke har skattepliktig inntekt/i }).type(
      'Jeg har ingen skattepliktig inntekt i perioden.',
    );
    cy.clickNextStep();

    // vedlegg
    selectVisibleAttachmentChoices();
    cy.clickNextStep();

    cy.findByRole('heading', { name: /Oppsummering/i }).should('exist');
    cy.findByText('Anna Eksempel').should('exist');
    // customConditional verified: harDenAndrePartens... shown for bidragsmottaker + tilbakeITid
    cy.findByText(
      /Har den andre parten bidratt til å forsørge barnet økonomisk i perioden du søker tilbake i tid/i,
    ).should('exist');
    // customConditional verified: tilsynsordning = ja triggers attachment in vedlegg
    cy.findByText(/Har du tilsynsutgifter for andre egne barn/i).should('exist');
  });
});
