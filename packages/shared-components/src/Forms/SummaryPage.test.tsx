import React from "react";
import {render, screen} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Router} from "react-router-dom";
import userEvent from "@testing-library/user-event";
import {TEXTS} from "@navikt/skjemadigitalisering-shared-domain";
import {SummaryPage, Props} from "./SummaryPage";

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useRouteMatch: () => ({url: '/forms/previous'}),
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

type Buttons = {
  redigerSvarKnapp: HTMLButtonElement;
  gaVidereKnapp: HTMLButtonElement;
  sendIPostenKnapp: HTMLButtonElement;
  sendDigitaltKnapp: HTMLButtonElement;
};

const getButton = (label): HTMLButtonElement => screen.queryByRole('link', {name: label}) as HTMLButtonElement;

const getButtons = (): Buttons => {
  const redigerSvarKnapp = getButton(TEXTS.summaryPage.editAnswers) as HTMLButtonElement;
  const gaVidereKnapp = getButton(TEXTS.summaryPage.continue) as HTMLButtonElement;
  const sendIPostenKnapp = getButton(TEXTS.summaryPage.continueToPostalSubmission) as HTMLButtonElement;
  const sendDigitaltKnapp = getButton(TEXTS.summaryPage.continueToDigitalSubmission) as HTMLButtonElement;
  return {redigerSvarKnapp, gaVidereKnapp, sendIPostenKnapp, sendDigitaltKnapp};
}

const renderSummaryPage = async (props: Partial<Props>): Promise<{ history: any, buttons: Buttons }> => {
  const history = createMemoryHistory();
  const summaryPageProps: Props = {
    formUrl: '/testform',
    submission: {},
    form: {},
    ...props,
  };
  render(
    <Router history={history}>
      <SummaryPage {...summaryPageProps} />
    </Router>
  );
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole('heading', {name: summaryPageProps.form.title});
  return {history, buttons: getButtons()};
}

describe("SummaryPage", () => {

  describe('Form med både papir- og digital innsending', () => {

    const expectKnapperForPapirOgDigitalInnsending = (buttons: Buttons) => {
      const {redigerSvarKnapp, gaVidereKnapp, sendIPostenKnapp, sendDigitaltKnapp} = buttons;
      expect(redigerSvarKnapp).toBeInTheDocument()
      expect(sendIPostenKnapp).toBeInTheDocument()
      expect(sendDigitaltKnapp).toBeInTheDocument()
      expect(gaVidereKnapp).not.toBeInTheDocument()
    };

    it("Rendrer default form med riktige knapper", async () => {
      const form = formWithProperties({hasPapirInnsendingOnly: undefined, innsending: undefined});
      const {buttons} = await renderSummaryPage({form});
      expectKnapperForPapirOgDigitalInnsending(buttons);
    });

    it("Rendrer form med hasPapirInnsendingOnly=false", async () => {
      const form = formWithProperties({hasPapirInnsendingOnly: false, innsending: undefined});
      const {history, buttons} = await renderSummaryPage({form});
      expectKnapperForPapirOgDigitalInnsending(buttons);

      userEvent.click(buttons.sendDigitaltKnapp);
      expect(history.location.pathname).toBe("/testform/forbered-innsending");
    });

    it("Rendrer form med innsending=PAPIR_OG_DIGITAL", async () => {
      const form = formWithProperties({hasPapirInnsendingOnly: false, innsending: 'PAPIR_OG_DIGITAL'});
      const {history, buttons} = await renderSummaryPage({form});
      expectKnapperForPapirOgDigitalInnsending(buttons);

      userEvent.click(buttons.sendIPostenKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

  });

  const expectKnapperForRedigerSvarEllerGaVidere = (buttons: Buttons)  => {
    const {redigerSvarKnapp, gaVidereKnapp, sendIPostenKnapp, sendDigitaltKnapp} = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(gaVidereKnapp).toBeInTheDocument();
    expect(sendIPostenKnapp).not.toBeInTheDocument();
    expect(sendDigitaltKnapp).not.toBeInTheDocument();
  }

  describe('Form med kun papir-innsending', () => {

    it("Rendrer form med hasPapirInnsendingOnly=true", async () => {
      const form = formWithProperties({hasPapirInnsendingOnly: true});
      const {buttons, history} = await renderSummaryPage({form});
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("Rendrer form med innsending=KUN_PAPIR", async () => {
      const form = formWithProperties({innsending: 'KUN_PAPIR'});
      const {buttons, history} = await renderSummaryPage({form});
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

  });

  describe('Form med kun digital innsending', () => {

    it("Rendrer form med innsending=KUN_DIGITAL", async () => {
      const form = formWithProperties({innsending: 'KUN_DIGITAL'});
      const {history, buttons} = await renderSummaryPage({form});
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/forbered-innsending");
    });

  });

  describe('Form med ingen innsending', () => {

    it("Rendrer form med innsending=INGEN", async () => {
      const form = formWithProperties({innsending: 'INGEN'});
      const {history, buttons} = await renderSummaryPage({form});
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/ingen-innsending");
    });

  });

});
