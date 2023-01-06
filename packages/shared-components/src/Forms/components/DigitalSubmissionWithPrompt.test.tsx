import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppConfigProvider } from "../../configContext";
import { LanguagesProvider } from "../../context/languages";
import { Modal } from "../../index";
import DigitalSubmissionWithPrompt from "./DigitalSubmissionWithPrompt";

jest.mock("../../context/languages/useLanguageCodeFromURL", () => () => "nb-NO");

Modal.setAppElement(document.createElement("div"));

describe("DigitalSubmissionWithPrompt", () => {
  const onError = jest.fn();
  const onSuccess = jest.fn();
  const BASE_URL = "http://www.unittest.nav.no/fyllut";

  beforeEach(() => {
    const defaultForm = {
      components: [
        {
          type: "panel",
          components: [],
        },
      ],
    };

    render(
      <AppConfigProvider baseUrl={BASE_URL} app="fyllut">
        <LanguagesProvider translations={{}}>
          <DigitalSubmissionWithPrompt
            form={defaultForm}
            submission={{}}
            translations={{}}
            onError={onError}
            onSuccess={onSuccess}
          />
        </LanguagesProvider>
      </AppConfigProvider>
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
