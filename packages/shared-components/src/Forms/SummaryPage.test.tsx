import { FormPropertiesType, NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import nock from "nock";
import { Router } from "react-router-dom";
import { AppConfigContextType, AppConfigProvider } from "../configContext";
import { SendInnProvider } from "../context/sendInn/sendInnContext";
import { Modal } from "../index";
import { Props, SummaryPage } from "./SummaryPage";

const originalWindowLocation = window.location;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ url: "/forms/previous" }),
}));

jest.mock("../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

Modal.setAppElement(document.createElement("div"));

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
} as unknown as NavFormType;

const defaultFormWithAttachment = {
  ...defaultForm,
  components: [
    {
      title: "Vedlegg",
      key: "vedlegg",
      type: "panel",
      components: [
        {
          label: "Annen dokumentasjon",
          description: "Har du noen annen dokumentasjon du ønsker å legge ved?",
          key: "annenDokumentasjon",
          properties: {
            vedleggstittel: "Annet",
            vedleggskode: "N6",
          },
          otherDocumentation: true,
        },
      ],
      isAttachmentPanel: true,
    },
  ],
} as unknown as NavFormType;

const formWithProperties = (
  props: Partial<FormPropertiesType>,
  originalForm: Partial<NavFormType> = defaultForm
): NavFormType =>
  ({
    ...originalForm,
    properties: {
      ...originalForm.properties,
      ...props,
    },
  } as unknown as NavFormType);

type Buttons = {
  redigerSvarKnapp: HTMLButtonElement;
  gaVidereKnapp: HTMLButtonElement;
  sendTilNavKnapp: HTMLButtonElement;
};

const getButton = (label): HTMLButtonElement =>
  (screen.queryByRole("link", { name: label }) as HTMLButtonElement) ||
  (screen.queryByRole("button", { name: label }) as HTMLButtonElement);

const getButtons = (): Buttons => {
  const redigerSvarKnapp = getButton(TEXTS.grensesnitt.summaryPage.editAnswers) as HTMLButtonElement;
  const gaVidereKnapp = getButton(TEXTS.grensesnitt.moveForward) as HTMLButtonElement;
  const sendTilNavKnapp = getButton(TEXTS.grensesnitt.submitToNavPrompt.open) as HTMLButtonElement;
  return { redigerSvarKnapp, gaVidereKnapp, sendTilNavKnapp };
};

const renderSummaryPage = async (
  props: Partial<Props>,
  appConfigProps: AppConfigContextType = {} as AppConfigContextType
): Promise<{ history: any; buttons: Buttons }> => {
  const history = createMemoryHistory();
  const summaryPageProps: Props = {
    formUrl: "/testform",
    submission: {},
    form: {} as NavFormType,
    translations: {},
    ...props,
  } as Props;
  render(
    <AppConfigProvider {...appConfigProps}>
      <SendInnProvider form={defaultForm} translations={{}}>
        <Router history={history}>
          <SummaryPage {...summaryPageProps} />
        </Router>
      </SendInnProvider>
    </AppConfigProvider>
  );
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole("heading", { name: TEXTS.grensesnitt.title });
  return { history, buttons: getButtons() };
};

describe("SummaryPage", () => {
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

    it("innsending=KUN_DIGITAL - rendrer knapp for direkte innsending til NAV", async () => {
      const form = formWithProperties({ innsending: "KUN_DIGITAL" });
      const appConfigProps = { app: "bygger" } as AppConfigContextType;
      const { buttons } = await renderSummaryPage({ form }, appConfigProps);
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
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
    it("sender skjema med vedlegg til send-inn", async () => {
      const windowLocation = { href: "" };
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
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
      const { buttons } = await renderSummaryPage({ form }, { baseUrl: basePath });
      expectKnapperForRedigerSvarEllerGaVidere(buttons);

      userEvent.click(buttons.gaVidereKnapp);
      await waitFor(() => expect(windowLocation.href).toBe("https://www.unittest.nav.no/send-inn/123"));
      nock.isDone();

      window.location = originalWindowLocation;
    });

    it("ber om bekreftelse før den kaller send-inn når skjemaet er uten vedlegg", async () => {
      const windowLocation = { href: "" };
      const basePath = "https://www.unittest.nav.no/fyllut";
      const sendInnUrl = "https://www.unittest.nav.no/sendInn";
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
      const { buttons } = await renderSummaryPage({ form }, { baseUrl: basePath });
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
      expectKnapperForRedigerSvarEllerSendTilNav(buttons);
      userEvent.click(buttons.sendTilNavKnapp);
      userEvent.click(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.confirm }));

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
