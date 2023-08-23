import { DeclarationType, NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import { AppConfigContextType, AppConfigProvider } from "../../configContext";
import { SendInnProvider } from "../../context/sendInn/sendInnContext";
import { Props, SummaryPage } from "./SummaryPage";
import { Buttons, formWithProperties, getButtons } from "./test/helpers";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn().mockReturnValue({
    pathname: "/oppsummering",
    search: "",
  }),
}));

jest.mock("../../context/languages", () => ({
  useLanguages: () => ({ translate: (text) => text }),
}));

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
      <SendInnProvider form={(props.form ?? {}) as NavFormType} translations={{}} updateSubmission={jest.fn()}>
        <Router history={history}>
          <SummaryPage {...summaryPageProps} />
          <div id="formio-summary-hidden" hidden />
        </Router>
      </SendInnProvider>
    </AppConfigProvider>
  );
  // verifiser render ved å sjekke at overskrift finnes
  await screen.getByRole("heading", { level: 2, name: TEXTS.grensesnitt.title });
  return { history, buttons: getButtons(screen) };
};

describe("SummaryPage", () => {
  describe("ConfirmationPanel", () => {
    it("Ikke vis bekreftelse", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL", declarationType: DeclarationType.none });
      const { buttons, history } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      const confirmCheckbox = screen.queryByRole("checkbox", { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).not.toBeInTheDocument();
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("Bekreft dataene dine", async () => {
      const form = formWithProperties({ innsending: "KUN_PAPIR", declarationType: DeclarationType.default });
      const { buttons, history } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      const confirmCheckbox = screen.queryByRole("checkbox", { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).toBeInTheDocument();
      userEvent.click(confirmCheckbox!);
      expect(confirmCheckbox).toHaveAttribute("aria-invalid", "false");
      expect(confirmCheckbox).toHaveAttribute("aria-checked", "true");
      userEvent.click(buttons.gaVidereKnapp);
      expect(history.location.pathname).toBe("/testform/send-i-posten");
    });

    it("Ikke gå videre, uten å bekrefte dataene", async () => {
      const form = formWithProperties({ innsending: "PAPIR_OG_DIGITAL", declarationType: DeclarationType.default });
      const { buttons, history } = await renderSummaryPage({ form }, { submissionMethod: "paper" });
      const confirmCheckbox = screen.queryByRole("checkbox", { name: TEXTS.statiske.declaration.defaultText });
      expect(confirmCheckbox).toBeInTheDocument();
      userEvent.click(buttons.gaVidereKnapp);
      expect(confirmCheckbox).toHaveAttribute("aria-invalid", "true");
      expect(confirmCheckbox).toHaveAttribute("aria-checked", "false");
      expect(history.location.pathname).not.toBe("/testform/send-i-posten");
    });
  });
});
