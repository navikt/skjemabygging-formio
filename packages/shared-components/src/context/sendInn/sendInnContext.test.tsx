import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppConfigProvider } from "../../configContext";
import { http } from "../../index";
import { SendInnProvider, useSendInn } from "./sendInnContext";

describe("sendInnContext", () => {
  const TestComponent = ({ submission }) => {
    const { startMellomlagring, updateMellomlagring, submitSoknad, innsendingsId } = useSendInn();

    return (
      <>
        <div data-testid={"innsendings-id"}>{innsendingsId}</div>
        <button onClick={() => startMellomlagring(submission)}>Start mellomlagring</button>
        <button onClick={() => updateMellomlagring(submission)}>Oppdater mellomlagring</button>
        <button onClick={() => submitSoknad(submission)}>Send inn søknad</button>
      </>
    );
  };

  const mockHttp = {
    post: jest.fn(),
    put: jest.fn(),
  };
  const innsendingsId = "abc-123-456";
  const form = { title: "TestSkjema", components: [] } as unknown as NavFormType;
  const translations = {};
  const submission = { data: { question: "answer" } } as unknown as Submission;
  const submissionMethod = "digital";
  const headers = {};
  const opts = { redirectToLocation: false };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("When mellomlagring is enabled", () => {
    beforeEach(() => {
      mockHttp.post.mockReturnValue({ innsendingsId });
      render(
        <AppConfigProvider
          app={"fyllut"}
          submissionMethod={submissionMethod}
          featureToggles={{ enableMellomlagring: true }}
          http={mockHttp as unknown as typeof http}
          baseUrl={"http://test.example.no"}
          config={{ isTest: true }}
        >
          <MemoryRouter>
            <SendInnProvider form={form} translations={translations} updateSubmission={jest.fn()}>
              <TestComponent submission={submission} />
            </SendInnProvider>
          </MemoryRouter>
        </AppConfigProvider>
      );
    });

    describe("startMellomlagring", () => {
      it("sends a POST request to /api/send-inn/soknad", async () => {
        userEvent.click(screen.getByRole("button", { name: "Start mellomlagring" }));
        await waitFor(() => expect(screen.getByTestId("innsendings-id")).toHaveTextContent(innsendingsId));
        expect(mockHttp.post).toHaveBeenCalledTimes(1);
        expect(mockHttp.post).toHaveBeenCalledWith(
          "http://test.example.no/api/send-inn/soknad",
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
          }),
          headers,
          opts
        );
      });
    });

    describe("updateMellomlagring", () => {
      it("sends a PUT request to /api/send-inn/soknad", async () => {
        userEvent.click(screen.getByRole("button", { name: "Start mellomlagring" }));
        await waitFor(() => expect(screen.getByTestId("innsendings-id")).toHaveTextContent(innsendingsId));
        userEvent.click(screen.getByRole("button", { name: "Oppdater mellomlagring" }));
        expect(mockHttp.put).toHaveBeenCalledTimes(1);
        expect(mockHttp.put).toHaveBeenCalledWith(
          "http://test.example.no/api/send-inn/soknad",
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
            innsendingsId,
          }),
          headers,
          opts
        );
      });
    });

    describe("submitSoknad", () => {
      it("sends a PUT request to /api/send-inn/utfyltsoknad", async () => {
        userEvent.click(screen.getByRole("button", { name: "Start mellomlagring" }));
        await waitFor(() => expect(screen.getByTestId("innsendings-id")).toHaveTextContent(innsendingsId));
        userEvent.click(screen.getByRole("button", { name: "Send inn søknad" }));
        expect(mockHttp.put).toHaveBeenCalledTimes(1);
        expect(mockHttp.put).toHaveBeenCalledWith(
          "http://test.example.no/api/send-inn/utfyltsoknad",
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
            innsendingsId,
          }),
          headers,
          { redirectToLocation: true }
        );
      });
    });
  });

  describe("When mellomlagring is not enabled", () => {
    beforeEach(() => {
      render(
        <AppConfigProvider
          app={"fyllut"}
          submissionMethod={submissionMethod}
          featureToggles={{ enableMellomlagring: false }}
          http={mockHttp as unknown as typeof http}
          baseUrl={"http://test.example.no"}
          config={{ isTest: true }}
        >
          <MemoryRouter>
            <SendInnProvider form={form} translations={translations} updateSubmission={jest.fn()}>
              <TestComponent submission={submission} />
            </SendInnProvider>
          </MemoryRouter>
        </AppConfigProvider>
      );
    });

    describe("startMellomlagring", () => {
      it("does not send a POST request to /api/send-inn/soknad", async () => {
        userEvent.click(screen.getByRole("button", { name: "Start mellomlagring" }));
        expect(mockHttp.post).not.toHaveBeenCalled();
      });
    });

    describe("updateMellomlagring", () => {
      it("does not send a PUT request to /api/send-inn/soknad", async () => {
        userEvent.click(screen.getByRole("button", { name: "Oppdater mellomlagring" }));
        expect(mockHttp.put).not.toHaveBeenCalled();
      });
    });

    describe("submitSoknad", () => {
      it("sends a POST request to /api/send-inn", async () => {
        userEvent.click(screen.getByRole("button", { name: "Send inn søknad" }));
        await waitFor(() => expect(mockHttp.post).toHaveBeenCalledTimes(1));
        expect(mockHttp.post).toHaveBeenCalledWith(
          "http://test.example.no/api/send-inn",
          expect.objectContaining({
            form,
            submission,
            submissionMethod,
          }),
          headers,
          { redirectToLocation: true }
        );
      });
    });
  });
});
