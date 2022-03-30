import { render, screen, waitFor } from "@testing-library/react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { AppConfigProvider } from "../../configContext";
import { LanguagesProvider } from "../../context/languages";
import DigitalSubmissionButton, { Props } from "./DigitalSubmissionButton";

jest.mock("../../context/languages/useLanguageCodeFromURL", () => () => "nb-NO");

const BASE_URL = "http://www.unittest.nav.no/fyllut";
const SEND_INN_URL = "http://www.unittest.nav.no/sendInn/soknad/123";

const originalWindowLocation = window.location;

describe("DigitalSubmissionButton", () => {
  const defaultForm = {
    components: [
      {
        type: "panel",
        components: [],
      },
    ],
  };
  const defaultSubmission = {};
  const defaultTranslations = {};

  const renderButton = (props: Partial<Props> = {}) => {
    const defaultProps: Props = {
      form: defaultForm,
      submission: defaultSubmission,
      translations: defaultTranslations,
      onError: jest.fn(),
      onSuccess: jest.fn(),
      ...props,
    };
    render(
      <AppConfigProvider baseUrl={BASE_URL}>
        <LanguagesProvider translations={defaultTranslations}>
          <DigitalSubmissionButton {...defaultProps} />
        </LanguagesProvider>
      </AppConfigProvider>
    );
  };

  it("renders button", () => {
    renderButton();
    expect(screen.getByRole("button", { name: TEXTS.grensesnitt.moveForward })).toBeInTheDocument();
  });

  describe("backend endpoint", () => {
    let onError;
    let onSuccess;
    let windowLocation;

    beforeEach(() => {
      windowLocation = {href: ""};
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true
      });
      onError = jest.fn();
      onSuccess = jest.fn();
    });

    afterEach(() => {
      nock.isDone();
      window.location = originalWindowLocation;
    });

    it("calls onError when backend returns 500", async () => {
      nock(BASE_URL)
        .post("/api/send-inn")
        .reply(500, { message: "Feil ved kall til SendInn" });
      renderButton({ onError, onSuccess });
      const button = screen.getByRole("button", { name: TEXTS.grensesnitt.moveForward });
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(windowLocation.href).toEqual("");
    });

    it("redirects when backend returns 201 and Location header", async () => {
      nock(BASE_URL)
        .post("/api/send-inn")
        .reply(201, "CREATED", {Location: SEND_INN_URL});
      renderButton({ onError, onSuccess });
      const button = screen.getByRole("button", { name: TEXTS.grensesnitt.moveForward });
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(onError).toHaveBeenCalledTimes(0);
      expect(windowLocation.href).toEqual(SEND_INN_URL);
    });
  });
});
