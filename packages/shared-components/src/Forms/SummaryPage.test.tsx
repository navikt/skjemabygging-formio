import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import nock from "nock";
import React from "react";
import { Router } from "react-router-dom";
import { AppConfigContextType, AppConfigProvider } from "../configContext";
import { Props, SummaryPage } from "./SummaryPage";

const originalWindowLocation = window.location;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ url: "/forms/previous" }),
}));

jest.mock("../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

const defaultFormProperties = {
  skjemanummer: "NAV 10-11.13",
  tema: "BIL",
  innsending: undefined,
  hasLabeledSignatures: false,
  signatures: undefined,
};

const defaultForm = {
  title: "Mitt testskjema",
  properties: {
    ...defaultFormProperties,
  },
  components: [],
};

const formWithProperties = (props): NavFormType =>
  ({
    ...defaultForm,
    properties: {
      ...defaultFormProperties,
      ...props,
    },
  } as unknown as NavFormType);

type Buttons = {
  redigerSvarKnapp: HTMLButtonElement;
  gaVidereKnapp: HTMLButtonElement;
};

const getButton = (label): HTMLButtonElement =>
  (screen.queryByRole("link", { name: label }) as HTMLButtonElement) ||
  (screen.queryByRole("button", { name: label }) as HTMLButtonElement);

const getButtons = (): Buttons => {
  const redigerSvarKnapp = getButton(TEXTS.grensesnitt.summaryPage.editAnswers) as HTMLButtonElement;
  const gaVidereKnapp = getButton(TEXTS.grensesnitt.moveForward) as HTMLButtonElement;
  return { redigerSvarKnapp, gaVidereKnapp };
};

const renderSummaryPage = async (
  props: Partial<Props>,
  appConfigProps: AppConfigContextType = {}
): Promise<{ history: any; buttons: Buttons }> => {
  const history = createMemoryHistory();
  const summaryPageProps: Props = {
    formUrl: "/testform",
    submission: {},
    form: {} as NavFormType,
    translations: {},
    ...props,
  };
  render(
    <AppConfigProvider {...appConfigProps}>
      <Router history={history}>
        <SummaryPage {...summaryPageProps} />
      </Router>
    </AppConfigProvider>
  );
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole("heading", { name: summaryPageProps.form.title });
  return { history, buttons: getButtons() };
};

describe("SummaryPage", () => {
  const expectKnapperForRedigerSvarEllerGaVidere = (buttons: Buttons) => {
    const { redigerSvarKnapp, gaVidereKnapp } = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(gaVidereKnapp).toBeInTheDocument();
  };

  describe("Form som støtter både papir- og digital innsending", () => {
    it("Rendrer default form med riktige knapper", async () => {
      const form = formWithProperties({ innsending: undefined });
      const { history, buttons } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("Rendrer form med innsending=PAPIR_OG_DIGITAL", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { history, buttons } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Forhåndvisning i 'bygger' bruker papir-løpet uansett innsending", () => {
    it("innsending=PAPIR_OG_DIGITAL, submissionMethod=paper", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const appConfigProps = { submissionMethod: "paper", app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPage({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("innsending=PAPIR_OG_DIGITAL, submissionMethod=digital", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const appConfigProps = { submissionMethod: "digital", app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPage({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("innsending=KUN_DIGITAL", async () => {
      const form = formWithProperties({ innsending: "KUN_DIGITAL" });
      const appConfigProps = { app: "bygger" } as AppConfigContextType;
      const { buttons } = await renderSummaryPage({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    it("innsending=KUN_PAPIR", async () => {
      const form = formWithProperties({ innsending: "KUN_PAPIR" });
      const appConfigProps = { app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPage({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Form med kun papir-innsending", () => {
    it("Rendrer form med innsending=KUN_PAPIR", async () => {
      const form = formWithProperties({ innsending: "KUN_PAPIR" });
      const { buttons, history } = await renderSummaryPage({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Form med kun digital innsending", () => {
    it("Rendrer form med innsending=KUN_DIGITAL", async () => {
      const windowLocation = { href: "" };
      // @ts-ignore
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .post("/api/send-inn")
        .reply(201, {}, { Location: "https://www.unittest.nav.no/send-inn/123" });
      const form = formWithProperties({ innsending: "KUN_DIGITAL" });
      const { buttons } = await renderSummaryPage({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });
  });

  describe("Form med ingen innsending", () => {
    it("Rendrer form med innsending=INGEN", async () => {
      const form = formWithProperties({ innsending: "INGEN" });
      const { history, buttons } = await renderSummaryPage({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/ingen-innsending");
    });
  });

  describe("Submission method", () => {
    it("renders next-button when method=digital", async () => {
      const windowLocation = { href: "" };
      // @ts-ignore
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .post("/api/send-inn")
        .reply(201, {}, { Location: "https://www.unittest.nav.no/send-inn/123" });
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { buttons } = await renderSummaryPage(
        { form },
        {
          submissionMethod: "digital",
          baseUrl: basePath,
        }
      );
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });
    it("renders next-button when method=paper", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { history, buttons } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });
});
