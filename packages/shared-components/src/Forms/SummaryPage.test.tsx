import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { SummaryPage, Props } from "./SummaryPage";

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({ url: '/forms/previous' }),
}));

jest.mock('../context/languages', () => ({
  useLanguages: () => ({translate: text => text}),
}));

const defaultFormProperties = {
  skjemanummer: 'NAV 10-11.13',
  tema: 'BIL',
  innsending: undefined,
  hasPapirInnsendingOnly: undefined,
  hasLabeledSignatures: false,
  signatures: undefined,
}

const defaultForm = {
  title: 'Mitt testskjema',
  properties: {
    ...defaultFormProperties,
  },
  components: []
};

const formWithProperties = (props) => ({
  ...defaultForm,
  properties: {
    ...defaultFormProperties,
    ...props,
  }
})

const renderSummaryPage = async (props: Partial<Props>) => {
  const summaryPageProps: Props = {
    formUrl: '/testform',
    submission: {},
    form: {},
    ...props,
  };
  render(<MemoryRouter><SummaryPage {...summaryPageProps} /></MemoryRouter>);
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole('heading', {name: summaryPageProps.form.title});
}

const getKnapp = label => screen.queryByRole('link', {name: label});

describe("SummaryPage", () => {

  describe('Form som støtter både papir- og digital innsending', () => {

    const expectKorrekteKnapperForPapirOgDigitalInnsending = () => {
      expect(getKnapp(TEXTS.summaryPage.editAnswers)).toBeInTheDocument()
      expect(getKnapp(TEXTS.summaryPage.continueToPostalSubmission)).toBeInTheDocument()
      expect(getKnapp(TEXTS.summaryPage.continueToDigitalSubmission)).toBeInTheDocument()
      expect(getKnapp(TEXTS.summaryPage.continue)).not.toBeInTheDocument()
    };

    it("Rendrer default form med riktige knapper", async() => {
      const form = formWithProperties({hasPapirInnsendingOnly: undefined, innsending: undefined});
      await renderSummaryPage({form});
      expectKorrekteKnapperForPapirOgDigitalInnsending();
    });

    it("Rendrer form med hasPapirInnsendingOnly=false", async() => {
      const form = formWithProperties({hasPapirInnsendingOnly: false, innsending: undefined});
      await renderSummaryPage({form});
      expectKorrekteKnapperForPapirOgDigitalInnsending();
    });

    it("Rendrer form med innsending=PAPIR_OG_DIGITAL", async() => {
      const form = formWithProperties({hasPapirInnsendingOnly: false, innsending: 'PAPIR_OG_DIGITAL'});
      await renderSummaryPage({form});
      expectKorrekteKnapperForPapirOgDigitalInnsending();
    });

  });

  const expectKorrekteKnapperForEntenPapirEllerDigital = () => {
    expect(getKnapp(TEXTS.summaryPage.editAnswers)).toBeInTheDocument()
    expect(getKnapp(TEXTS.summaryPage.continue)).toBeInTheDocument()
    expect(getKnapp(TEXTS.summaryPage.continueToPostalSubmission)).not.toBeInTheDocument()
    expect(getKnapp(TEXTS.summaryPage.continueToDigitalSubmission)).not.toBeInTheDocument()
  }

  describe('Form med kun papir-innsending', () => {

    it("Rendrer form med hasPapirInnsendingOnly=true", async() => {
      const form = formWithProperties({hasPapirInnsendingOnly: true});
      await renderSummaryPage({form});
      expectKorrekteKnapperForEntenPapirEllerDigital();
    });

    it("Rendrer form med innsending=KUN_PAPIR", async() => {
      const form = formWithProperties({innsending: 'KUN_PAPIR'});
      await renderSummaryPage({form});
      expectKorrekteKnapperForEntenPapirEllerDigital();
    });

  });

  describe('Form med kun digital innsending', () => {

    it("Rendrer form med innsending=KUN_DIGITAL", async() => {
      const form = formWithProperties({innsending: 'KUN_DIGITAL'});
      await renderSummaryPage({form});
      expectKorrekteKnapperForEntenPapirEllerDigital();
    });

  });

});
