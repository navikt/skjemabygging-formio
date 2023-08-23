import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import nock from "nock";
import { Router } from "react-router-dom";
import { AppConfigContextType, AppConfigProvider } from "../../configContext";
import { SendInnProvider } from "../../context/sendInn/sendInnContext";
import { Modal } from "../../index";
import SummaryPageNavigation, { Props } from "./SummaryPageNavigation";
import { defaultFormWithAttachment } from "./test/data";
import { Buttons, formWithProperties, getButtons } from "./test/helpers";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ url: "/forms/previous" }),
  useLocation: jest.fn().mockReturnValue({
    pathname: "/oppsummering",
    search: "",
  }),
}));

jest.mock("../../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

Modal.setAppElement(document.createElement("div"));

const originalWindowLocation = window.location;
const isValid = jest.fn().mockReturnValue(true);
const onError = jest.fn();

const renderSummaryPageNavigation = async (
  props: Partial<Props>,
  appConfigProps: AppConfigContextType = {} as AppConfigContextType
): Promise<{ history: any; buttons: Buttons }> => {
  const history = createMemoryHistory();
  const summaryPageProps: Props = {
    formUrl: "/testform",
    submission: {},
    form: {} as NavFormType,
    isValid,
    onError,
    ...props,
  } as Props;
  render(
    <AppConfigProvider {...appConfigProps}>
      <SendInnProvider form={(props.form ?? {}) as NavFormType} translations={{}} updateSubmission={jest.fn()}>
        <Router history={history}>
          <SummaryPageNavigation {...summaryPageProps} />
          <div id="formio-summary-hidden" hidden />
        </Router>
      </SendInnProvider>
    </AppConfigProvider>
  );
  await screen.getByRole("navigation");
  return { history, buttons: getButtons(screen) };
};

describe("SummaryPageNavigation", () => {
  const expectKnapperForRedigerSvarEllerGaVidere = (buttons: Buttons) => {
    const { redigerSvarKnapp, gaVidereKnapp } = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(gaVidereKnapp).toBeInTheDocument();
  };

  const expectKnapperForRedigerSvarEllerSendTilNav = (buttons: Buttons) => {
    const { redigerSvarKnapp, sendTilNavKnapp } = buttons;
    expect(redigerSvarKnapp).toBeInTheDocument();
    expect(sendTilNavKnapp).toBeInTheDocument();
  };

  describe("Når valgt innsendingstype er papir", () => {
    it("når skjeamets innsendingstype er undefined, rendres knapp for å gå videre til send-i-posten", async () => {
      const form = formWithProperties({ innsending: undefined });
      const { history, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("når skjemaets innsendingstype er PAPIR_OG_DIGITAL, rendres knapp for å gå videre til send-i-posten", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { history, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Forhåndvisning i 'bygger' bruker papir-løpet uansett innsending", () => {
    it("innsending=PAPIR_OG_DIGITAL, submissionMethod=paper", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const appConfigProps = { submissionMethod: "paper", app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("innsending=PAPIR_OG_DIGITAL, submissionMethod=digital", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const appConfigProps = { submissionMethod: "digital", app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("innsending=KUN_DIGITAL - rendrer knapp for direkte innsending til NAV", async () => {
      const form = formWithProperties({ innsending: "KUN_DIGITAL" });
      const appConfigProps = { app: "bygger" } as AppConfigContextType;
      const { buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
    });

    it("innsending=KUN_PAPIR", async () => {
      const form = formWithProperties({ innsending: "KUN_PAPIR" });
      const appConfigProps = { app: "bygger" } as AppConfigContextType;
      const { history, buttons } = await renderSummaryPageNavigation({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Form med kun papir-innsending", () => {
    it("Rendrer form med innsending=KUN_PAPIR", async () => {
      const form = formWithProperties({ innsending: "KUN_PAPIR" });
      const { buttons, history } = await renderSummaryPageNavigation({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });

  describe("Form med kun digital innsending", () => {
    it("sender skjema med vedlegg til send-inn", async () => {
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
      const windowLocation = { href: basePath };
      // @ts-ignore
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .post("/api/send-inn")
        .reply(201, {}, { Location: "https://www.unittest.nav.no/send-inn/123" });
      const form = formWithProperties({ innsending: "KUN_DIGITAL" }, defaultFormWithAttachment);
      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });

    it("ber om bekreftelse før den kaller send-inn når skjemaet er uten vedlegg", async () => {
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
      const windowLocation = { href: basePath };
      // @ts-ignore
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .post("/api/send-inn")
        .reply(201, {}, { Location: "https://www.unittest.nav.no/send-inn/123" });
      const form = formWithProperties({ innsending: "KUN_DIGITAL" });
      const { buttons } = await renderSummaryPageNavigation({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);

      userEvent.click(buttons.sendTilNavKnapp);
      userEvent.click(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));
      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });
  });

  describe("Form med ingen innsending", () => {
    it("Rendrer form med innsending=INGEN", async () => {
      const form = formWithProperties({ innsending: "INGEN" });
      const { history, buttons } = await renderSummaryPageNavigation({ form });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/ingen-innsending");
    });
  });

  describe("Submission method", () => {
    it("renders next-button when method=digital", async () => {
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
      const windowLocation = { href: basePath };
      // @ts-ignore
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      nock(basePath)
        .defaultReplyHeaders({
          Location: sendInnUrl,
        })
        .post("/api/send-inn")
        .reply(201, {}, { Location: "https://www.unittest.nav.no/send-inn/123" });
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { buttons } = await renderSummaryPageNavigation(
        { form },
        {
          submissionMethod: "digital",
          baseUrl: basePath,
        }
      );
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
      userEvent.click(buttons.sendTilNavKnapp);
      userEvent.click(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));

      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });
    it("renders next-button when method=paper", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL" });
      const { history, buttons } = await renderSummaryPageNavigation({ form }, { submissionMethod: "paper" });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });
  });
});
