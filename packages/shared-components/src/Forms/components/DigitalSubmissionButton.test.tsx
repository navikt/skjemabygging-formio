import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import { AppConfigContextType, AppConfigProvider } from "../../configContext";
import { LanguagesProvider } from "../../context/languages";
import DigitalSubmissionButton, { Props } from "./DigitalSubmissionButton";

jest.mock("../../context/languages/useLanguageCodeFromURL", () => () => "nb-NO");

const BASE_URL = "http://www.unittest.nav.no/fyllut";
const SEND_INN_URL = "http://www.unittest.nav.no/sendInn/soknad/123";

const originalWindowLocation = window.location;

const defaultAppConfigProps: Partial<AppConfigContextType> = {
  baseUrl: BASE_URL,
  app: "fyllut",
} as AppConfigContextType;

describe("DigitalSubmissionButton", () => {
  const defaultSubmission = {};
  const defaultTranslations = {};

  const renderButton = (props: Partial<Props> = {}, appConfigProps: Partial<AppConfigContextType> = {}) => {
    const defaultProps: Props = {
      submission: defaultSubmission,
      onError: jest.fn(),
      onSuccess: jest.fn(),
      children: "Digital submission",
      ...props,
    } as Props;
    render(
      <AppConfigProvider {...defaultAppConfigProps} {...appConfigProps}>
        <LanguagesProvider translations={defaultTranslations}>
          <DigitalSubmissionButton {...defaultProps} />
        </LanguagesProvider>
      </AppConfigProvider>
    );
  };

  it("renders button", () => {
    renderButton();
    expect(screen.getByRole("button", { name: "Digital submission" })).toBeInTheDocument();
  });

  describe("backend endpoint", () => {
    let onError;
    let onSuccess;
    let windowLocation;

    beforeEach(() => {
      windowLocation = { href: "" };
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      onError = jest.fn();
      onSuccess = jest.fn();
    });

    afterEach(() => {
      nock.isDone();
      window.location = originalWindowLocation;
    });

    it("calls onError when backend returns 500", async () => {
      nock(BASE_URL).post("/api/send-inn").reply(500, { message: "Feil ved kall til SendInn" });
      renderButton({ onError, onSuccess });
      const button = screen.getByRole("button", { name: "Digital submission" });
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(windowLocation.href).toEqual("");
    });

    it("redirects when backend returns 201 and Location header", async () => {
      nock(BASE_URL).post("/api/send-inn").reply(201, "CREATED", { Location: SEND_INN_URL });
      renderButton({ onError, onSuccess });
      const button = screen.getByRole("button", { name: "Digital submission" });
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(onError).toHaveBeenCalledTimes(0);
      expect(windowLocation.href).toEqual(SEND_INN_URL);
    });

    it("responds with error when clicked in application 'bygger'", async () => {
      nock(BASE_URL).post("/api/send-inn").reply(201, "CREATED", { Location: SEND_INN_URL });
      renderButton({ onError, onSuccess }, { app: "bygger" });
      const button = screen.getByRole("button", { name: "Digital submission" });
      expect(button).toBeInTheDocument();
      userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(onError.mock.calls[0][0].message).toEqual(
        "Digital innsending er ikke støttet ved forhåndsvisning i byggeren."
      );
      expect(windowLocation.href).toEqual("");
    });
  });
});
