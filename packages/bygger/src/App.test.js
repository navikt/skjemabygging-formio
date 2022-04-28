import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import createMockImplementation from "../test/backendMockImplementation";
import App from "./App";
import { AuthContext } from "./context/auth-context";
import featureToggles from "./featureToggles";

const createFakeChannel = () => ({
  bind: jest.fn(),
  unbind: jest.fn(),
});

describe("App", () => {
  beforeEach(() => {
    fetchMock.mockImplementation(createMockImplementation());
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
