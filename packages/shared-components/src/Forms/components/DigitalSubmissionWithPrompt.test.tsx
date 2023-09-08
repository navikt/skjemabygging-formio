import { Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppConfigProvider } from "../../configContext";
import { LanguagesProvider } from "../../context/languages";
import { Modal } from "../../index";
import DigitalSubmissionWithPrompt from "./DigitalSubmissionWithPrompt";

vi.mock("../../context/languages/useLanguageCodeFromURL", () => {
  return {
    default: () => "nb-NO",
  };
});

Modal.setAppElement(document.createElement("div"));

describe("DigitalSubmissionWithPrompt", () => {
  const onError = vi.fn();
  const onSuccess = vi.fn();
  const BASE_URL = "http://www.unittest.nav.no/fyllut";

  beforeEach(() => {
    render(
      <AppConfigProvider baseUrl={BASE_URL} app="fyllut">
        <LanguagesProvider translations={{}}>
          <DigitalSubmissionWithPrompt submission={{} as Submission} onError={onError} onSuccess={onSuccess} />
        </LanguagesProvider>
      </AppConfigProvider>,
    );
  });

  it('renders "Send to NAV"-button', () => {
    expect(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.open })).toBeInTheDocument();
  });

  it('renders modal with "DigitalSubmissionButton" when "Send to NAV" is clicked', () => {
    fireEvent.click(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.open }));
    expect(screen.getByRole("button", { name: TEXTS.grensesnitt.submitToNavPrompt.confirm })).toBeInTheDocument();
  });
});
