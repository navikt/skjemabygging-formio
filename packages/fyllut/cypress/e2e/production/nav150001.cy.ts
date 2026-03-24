/*
 * Production form tests for Søknad om overgangsstønad – enslig mor eller far
 * Form: nav150001
 * Submission types: PAPER
 *
 * Panels tested:
 *   - Dine opplysninger (dineOpplysninger): 1 same-panel conditional
 *       jegHarIkkeTelefonnummer → telefonnummer hidden
 *   - Sivilstand (sivilstand): 4 same-panel conditionals
 *       hvaErDinSivilstand → giftetDuDegIUtlandet / harDereSoktOmSeparasjon... / ugift follow-ups
 *       harDereSoktOmSeparasjon... → separation dates
 *   - Bosituasjon (bosituasjon): 3 same-panel conditionals
 *       delerDuBoligMedAndreVoksne → gifteplaner or samboer branch
 *       harDuKonkretePlanerOmAGifteDegEllerBliSamboer → hvilkenDatoSkalDetteSkje...
 *   - Barna og samvær (barnOgSamvaer): 5 row-scoped conditionals
 *       harDuOmsorgForBarnUnder18Ar → child datagrid
 *       kanDuGiOssNavnetPaDenAndreForelderen → parent details
 *       borBarnetsAndreForelderINorge2 → country field
 *       harDenAndreForelderenSamvaerMedBarnet → agreement question
 *       harDereSkriftligSamvaersavtaleForBarnet2 → samvær textarea
 *   - Arbeid, utdanning og andre aktiviteter (arbeidUtdanningOgAndreAktiviteter): 1 same-panel + 1 cross-panel conditional
 *       hvordanErArbeidssituasjonenDin → narSkalDuStarteINyJobbDdMmAaaa
 *       + arbeidskontraktSomViserAtDuHarFattTilbudOmArbeid on Vedlegg
 */

const visitWithFreshState = (url: string) => {
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    },
  });
  cy.defaultWaits();
  cy.get('#page-title').should('exist');
};

const visitPanel = (panelKey: string) => {
  visitWithFreshState(`/fyllut/nav150001/${panelKey}?sub=paper`);
};

const selectRadio = (label: string | RegExp, option: string | RegExp) => {
  cy.withinComponent(label, () => {
    cy.findByRole('radio', { name: option }).click();
  });
};

const setSelectboxesOption = (groupLabel: string | RegExp, option: string, checked: boolean) => {
  cy.findByRole('group', { name: groupLabel }).within(() => {
    if (checked) {
      cy.findByRole('checkbox', { name: option }).check();
    } else {
      cy.findByRole('checkbox', { name: option }).uncheck();
    }
  });
};

const ensureOnVeiledning = () => {
  cy.get('#page-title')
    .invoke('text')
    .then((title) => {
      const normalizedTitle = title.trim();

      if (normalizedTitle === 'Introduksjon') {
        cy.clickNextStep();
        ensureOnVeiledning();
        return;
      }

      expect(normalizedTitle).to.equal('Veiledning');
    });
};

const ensureOnVedlegg = () => {
  cy.get('body').then(($body) => {
    const title = $body.find('h2#page-title').text().trim();

    if (title !== 'Vedlegg') {
      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
    }
  });

  cy.get('#page-title').should('contain.text', 'Vedlegg');
};

const completeVedleggAndReachSummary = () => {
  cy.findByRole('group', { name: /Annen dokumentasjon|Annet/ }).within(() => {
    cy.findByRole('radio', { name: /Nei/ }).click();
  });

  cy.clickNextStep();

  const advanceToSummary = (): void => {
    cy.get('#page-title')
      .invoke('text')
      .then((title) => {
        if (title.trim() !== 'Oppsummering') {
          cy.clickNextStep();
          advanceToSummary();
        }
      });
  };

  advanceToSummary();
  cy.findByRole('heading', { level: 2, name: 'Oppsummering' }).should('exist');
};

const fillChildRow = ({
  otherParentInNorway,
  samvaer,
  expectNearbyLivingQuestion = false,
}: {
  otherParentInNorway: 'Ja' | 'Nei';
  samvaer:
    | 'Ja, mer enn én ettermiddag i uken med overnatting og annenhver helg eller tilsvarende'
    | 'Nei, den andre forelderen skal ikke ha samvær med barnet';
  expectNearbyLivingQuestion?: boolean;
}) => {
  cy.findAllByRole('textbox', { name: 'Barnets fornavn' }).first().type('Mia');
  cy.findAllByRole('textbox', { name: 'Barnets etternavn' }).first().type('Nordmann');
  cy.findAllByRole('textbox', { name: /Fødselsdato/ })
    .first()
    .type('01.01.2020');

  selectRadio('Bor barnet fast sammen med deg?', 'Ja');
  selectRadio('Skal barnet ha adresse hos deg?', 'Ja, og vi skal registrere adressen i Folkeregisteret');
  selectRadio('Kan du gi oss navnet på den andre forelderen?', 'Ja');

  cy.findAllByRole('textbox', { name: 'Fornavn' }).last().type('Per');
  cy.findAllByRole('textbox', { name: 'Etternavn' }).last().type('Forelder');
  cy.findAllByRole('textbox', { name: /fødselsnummer/i })
    .last()
    .type('17912099997');

  selectRadio('Bor barnets andre forelder i Norge?', otherParentInNorway);

  if (otherParentInNorway === 'Nei') {
    cy.findByRole('combobox', { name: 'Hvilket land bor den andre forelderen i?' }).type('Sver{downArrow}{enter}');
  }

  cy.get('body').then(($body) => {
    if ($body.text().includes('Har du og den andre forelderen ha skriftlig avtale om delt fast bosted for barnet?')) {
      selectRadio('Har du og den andre forelderen ha skriftlig avtale om delt fast bosted for barnet?', 'Nei');
    }
  });

  selectRadio('Har den andre forelderen samvær med barnet?', samvaer);

  if (expectNearbyLivingQuestion) {
    selectRadio(
      'Bor du og den andre forelderen til barnet i samme hus, blokk, gårdstun, kvartal, vei eller gate?',
      'Nei',
    );
  } else {
    cy.get('body').then(($body) => {
      if (
        $body
          .text()
          .includes('Bor du og den andre forelderen til barnet i samme hus, blokk, gårdstun, kvartal, vei eller gate?')
      ) {
        selectRadio(
          'Bor du og den andre forelderen til barnet i samme hus, blokk, gårdstun, kvartal, vei eller gate?',
          'Nei',
        );
      }
    });
  }
  selectRadio('Har du bodd sammen med den andre forelderen til barnet før?', 'Nei');
  selectRadio('Hvor mye er du sammen med den andre forelderen til barnet?', 'Vi møtes ikke');
};

describe('nav150001', () => {
  beforeEach(() => {
    cy.defaultIntercepts();
    cy.defaultInterceptsExternal();
  });

  describe('Dine opplysninger conditionals', () => {
    beforeEach(() => {
      visitPanel('dineOpplysninger');
    });

    it('hides and re-shows phone input when the no-phone checkbox changes', () => {
      cy.findByLabelText('Telefonnummer').should('exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('not.exist');

      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.findByLabelText('Telefonnummer').should('exist');
    });
  });

  describe('Sivilstand conditionals', () => {
    beforeEach(() => {
      visitPanel('sivilstand');
    });

    it('switches between the married separation flow and the ugift follow-up questions', () => {
      cy.findByLabelText('Giftet du deg i utlandet?').should('not.exist');
      cy.findByLabelText('Har dere søkt om separasjon, søkt om skilsmisse eller reist sak for domstolen?').should(
        'not.exist',
      );
      cy.findByLabelText('Hvorfor er du alene med barn?').should('not.exist');

      selectRadio('Hva er din sivilstand?', 'Gift / registrert partnerskap');

      cy.findByLabelText('Giftet du deg i utlandet?').should('exist');
      cy.findByLabelText('Har dere søkt om separasjon, søkt om skilsmisse eller reist sak for domstolen?').should(
        'exist',
      );
      cy.findByLabelText('Hvorfor er du alene med barn?').should('not.exist');

      selectRadio('Har dere søkt om separasjon, søkt om skilsmisse eller reist sak for domstolen?', 'Ja');
      cy.findByLabelText('Når søkte dere eller reiste sak? (dd.mm.åååå)').should('exist');
      cy.findByLabelText('Når flyttet dere fra hverandre? (dd.mm.åååå)').should('exist');

      selectRadio('Hva er din sivilstand?', 'Ugift');

      cy.findByLabelText('Giftet du deg i utlandet?').should('not.exist');
      cy.findByLabelText('Har dere søkt om separasjon, søkt om skilsmisse eller reist sak for domstolen?').should(
        'not.exist',
      );
      cy.findByLabelText('Er du gift uten at det er registrert i folkeregisteret i Norge?').should('exist');
      cy.findByLabelText('Er du separert eller skilt uten at dette er registrert i folkeregisteret i Norge?').should(
        'exist',
      );
      cy.findByLabelText('Hvorfor er du alene med barn?').should('exist');
    });
  });

  describe('Bosituasjon conditionals', () => {
    beforeEach(() => {
      visitPanel('bosituasjon');
    });

    it('switches between future-plans and current-samboer branches', () => {
      cy.findByLabelText('Har du konkrete planer om å gifte deg eller bli samboer?').should('not.exist');
      cy.findByLabelText('Hvilken dato flyttet dere sammen? (dd.mm.åååå)').should('not.exist');

      selectRadio('Deler du bolig med andre voksne?', 'Nei, jeg bor alene med barn eller jeg er gravid og bor alene');

      cy.findByLabelText('Har du konkrete planer om å gifte deg eller bli samboer?').should('exist');

      selectRadio('Har du konkrete planer om å gifte deg eller bli samboer?', 'Ja');
      cy.findByLabelText('Hvilken dato skal dette skje? (dd.mm.åååå)').should('exist');

      selectRadio('Deler du bolig med andre voksne?', 'Ja, jeg bor med kjæresten min');

      cy.findByLabelText('Har du konkrete planer om å gifte deg eller bli samboer?').should('not.exist');
      cy.findByLabelText('Hvilken dato flyttet dere sammen? (dd.mm.åååå)').should('exist');
    });
  });

  describe('Barna og samvær conditionals', () => {
    beforeEach(() => {
      visitPanel('barnOgSamvaer');
    });

    it('reveals row-scoped parent, country and samvær follow-up questions', () => {
      cy.findByRole('textbox', { name: 'Barnets fornavn' }).should('not.exist');
      cy.findByLabelText('Hvilket land bor den andre forelderen i?').should('not.exist');
      cy.findByLabelText('Har dere skriftlig samværsavtale for barnet?').should('not.exist');
      cy.findByRole('textbox', { name: 'Hvordan praktiserer dere samværet?' }).should('not.exist');

      selectRadio('Venter du barn?', 'Nei');
      selectRadio('Har du omsorg for barn under 18 år?', 'Ja');
      fillChildRow({
        otherParentInNorway: 'Nei',
        samvaer: 'Ja, mer enn én ettermiddag i uken med overnatting og annenhver helg eller tilsvarende',
      });

      cy.findByLabelText('Hvilket land bor den andre forelderen i?').should('exist');
      cy.findByLabelText('Har dere skriftlig samværsavtale for barnet?').should('exist');

      selectRadio('Har dere skriftlig samværsavtale for barnet?', 'Nei');
      cy.findByRole('textbox', { name: 'Hvordan praktiserer dere samværet?' }).should('exist');
    });
  });

  describe('Arbeid, utdanning og andre aktiviteter conditionals', () => {
    beforeEach(() => {
      visitPanel('arbeidUtdanningOgAndreAktiviteter');
    });

    it('shows the job-offer date and matching Vedlegg attachment only for the checked selectbox option', () => {
      cy.findByLabelText('Når skal du starte i ny jobb? (dd.mm.åååå)').should('not.exist');

      setSelectboxesOption(/Hvordan er arbeidssituasjonen din/, 'Jeg har fått tilbud om jobb', true);
      cy.findByLabelText('Når skal du starte i ny jobb? (dd.mm.åååå)').should('exist');

      cy.clickShowAllSteps();
      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Arbeidskontrakt|Arbeidsavtale/ }).should('exist');

      cy.findByRole('link', { name: 'Arbeid, utdanning og andre aktiviteter' }).click();
      setSelectboxesOption(/Hvordan er arbeidssituasjonen din/, 'Jeg har fått tilbud om jobb', false);
      cy.findByLabelText('Når skal du starte i ny jobb? (dd.mm.åååå)').should('not.exist');

      cy.findByRole('link', { name: 'Vedlegg' }).click();
      cy.findByRole('group', { name: /Arbeidskontrakt|Arbeidsavtale/ }).should('not.exist');
    });
  });

  describe('Summary', () => {
    beforeEach(() => {
      visitWithFreshState('/fyllut/nav150001?sub=paper');
      ensureOnVeiledning();
    });

    it('fills a happy path and verifies the summary', () => {
      cy.findByRole('checkbox', {
        name: /Jeg er klar over at jeg kan miste retten til overgangsstønad/,
      }).click();
      cy.findByRole('checkbox', {
        name: 'Jeg bekrefter at jeg vil gi riktige og fullstendige opplysninger',
      }).click();
      cy.clickNextStep();

      cy.findByRole('textbox', { name: 'Fornavn' }).type('Ola');
      cy.findByRole('textbox', { name: 'Etternavn' }).type('Nordmann');
      selectRadio('Har du norsk fødselsnummer eller d-nummer?', 'Ja');
      cy.findByRole('textbox', { name: /fødselsnummer/i }).type('17912099997');
      cy.findByRole('checkbox', { name: /Jeg har ikke telefonnummer/ }).click();
      cy.clickNextStep();

      selectRadio('Hva er din sivilstand?', 'Ugift');
      selectRadio('Er du gift uten at det er registrert i folkeregisteret i Norge?', 'Nei');
      selectRadio('Er du separert eller skilt uten at dette er registrert i folkeregisteret i Norge?', 'Nei');
      selectRadio('Hvorfor er du alene med barn?', 'Jeg er alene med barn fra fødsel');
      cy.clickNextStep();

      selectRadio('Oppholder du og barnet/barna dere i Norge?', 'Ja');
      selectRadio('Har du bodd i Norge sammenhengende de siste fem årene?', 'Ja');
      cy.clickNextStep();

      selectRadio('Deler du bolig med andre voksne?', 'Nei, jeg bor alene med barn eller jeg er gravid og bor alene');
      selectRadio('Har du konkrete planer om å gifte deg eller bli samboer?', 'Nei');
      cy.clickNextStep();

      selectRadio('Venter du barn?', 'Nei');
      selectRadio('Har du omsorg for barn under 18 år?', 'Ja');
      fillChildRow({
        otherParentInNorway: 'Ja',
        samvaer: 'Nei, den andre forelderen skal ikke ha samvær med barnet',
        expectNearbyLivingQuestion: true,
      });
      cy.clickNextStep();

      setSelectboxesOption(
        /Hvordan er arbeidssituasjonen din/,
        'Jeg er ikke i arbeid, utdanning eller arbeidssøker',
        true,
      );
      cy.clickNextStep();

      setSelectboxesOption(/Gjelder noe av dette deg/, 'Nei', true);
      selectRadio('Har du sagt opp jobben eller redusert arbeidstiden de siste 6 månedene?', 'Nei');
      selectRadio(
        'Søker du overgangsstønad fra en bestemt måned?',
        'Nei, NAV kan vurdere fra hvilken måned jeg har rett til stønad',
      );
      cy.clickNextStep();

      ensureOnVedlegg();
      completeVedleggAndReachSummary();

      cy.withinSummaryGroup('Sivilstand', () => {
        cy.contains('dt', 'Hva er din sivilstand?').next('dd').should('contain.text', 'Ugift');
      });

      cy.withinSummaryGroup('Barna og samvær', () => {
        cy.contains('dd', 'Mia').should('exist');
      });

      cy.withinSummaryGroup('Arbeid, utdanning og andre aktiviteter', () => {
        cy.contains('dd', 'Jeg er ikke i arbeid, utdanning eller arbeidssøker').should('exist');
      });
    });
  });
});
