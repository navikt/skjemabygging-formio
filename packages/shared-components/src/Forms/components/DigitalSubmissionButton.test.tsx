import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import { AppConfigContextType, AppConfigProvider } from "../../configContext";
import { LanguagesProvider } from "../../context/languages";
import { SendInnProvider } from "../../context/sendInn/sendInnContext";
import DigitalSubmissionButton, { Props } from "./DigitalSubmissionButton";

vi.mock("../../context/languages/useLanguageCodeFromURL", () => {
  return {
    default: () => "nb-NO",
  };
});

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
      onError: vi.fn(),
      onSuccess: vi.fn(),
      children: "Digital submission",
      ...props,
    } as Props;
    render(
      <AppConfigProvider {...defaultAppConfigProps} {...appConfigProps}>
        <SendInnProvider form={{ components: [] } as unknown as NavFormType} translations={{}}>
          <LanguagesProvider translations={defaultTranslations}>
            <DigitalSubmissionButton {...defaultProps} />
          </LanguagesProvider>
        </SendInnProvider>
      </AppConfigProvider>,
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
    const baseUrl = "http://baseUrl.fyllut.no";

    beforeEach(() => {
      windowLocation = { href: baseUrl };
      Object.defineProperty(window, "location", {
        value: windowLocation,
        writable: true,
      });
      onError = vi.fn();
      onSuccess = vi.fn();
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
      await userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(windowLocation.href).toEqual(baseUrl);
    });

    it("redirects when backend returns 201 and Location header", async () => {
      nock(BASE_URL).post("/api/send-inn").reply(201, "CREATED", { Location: SEND_INN_URL });
      renderButton({ onError, onSuccess });
      const button = screen.getByRole("button", { name: "Digital submission" });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(onError).toHaveBeenCalledTimes(0);
      expect(windowLocation.href).toEqual(SEND_INN_URL);
    });

    it("responds with error when clicked in application 'bygger'", async () => {
      nock(BASE_URL).post("/api/send-inn").reply(201, "CREATED", { Location: SEND_INN_URL });
      renderButton({ onError, onSuccess }, { app: "bygger" });
      const button = screen.getByRole("button", { name: "Digital submission" });
      expect(button).toBeInTheDocument();
      await userEvent.click(button);
      await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
      expect(onError.mock.calls[0][0].message).toEqual(
        "Digital innsending er ikke støttet ved forhåndsvisning i byggeren.",
      );
      expect(windowLocation.href).toEqual(baseUrl);
    });
  });
});
