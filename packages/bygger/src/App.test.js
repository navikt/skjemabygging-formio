import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthContext } from "./context/auth-context";
import { FakeBackend } from "./fakeBackend/FakeBackend";
import { dispatcherWithBackend } from "./fakeBackend/fakeWebApp";
import { InprocessQuipApp } from "./fakeBackend/InprocessQuipApp";
import featureToggles from "./featureToggles";

const createFakeChannel = () => ({
  bind: jest.fn(),
  unbind: jest.fn(),
});

describe("App", () => {
  beforeEach(() => {
    const mockBackend = new InprocessQuipApp(dispatcherWithBackend(new FakeBackend()));
    fetchMock.mockImplementation(mockBackend.fetchImpl);
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  test("Redirect til login form", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthContext.Provider
          value={{
            userData: null,
            login: () => {},
          }}
        >
          <AppConfigProvider featureToggles={featureToggles}>
            <App projectURL="http://myproject.example.org" pusher={{ subscribe: () => createFakeChannel() }} />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByLabelText("Email")).toBeTruthy();
    expect(await screen.findByLabelText("Password")).toBeTruthy();
  });
});
