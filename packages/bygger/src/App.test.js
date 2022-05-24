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

  const renderApp = (appConfigProps = {}) => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthContext.Provider
          value={{
            userData: null,
            login: () => {},
          }}
        >
          <AppConfigProvider featureToggles={featureToggles} {...appConfigProps}>
            <App projectURL="http://myproject.example.org" pusher={{ subscribe: () => createFakeChannel() }} />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  test("Show login form in development", async () => {
    renderApp({ config: { isDevelopment: true } });
    expect(await screen.findByLabelText("Email")).toBeTruthy();
    expect(await screen.findByLabelText("Password")).toBeTruthy();
  });

  test("Do not show login form when not development", async () => {
    renderApp({ config: { isDevelopment: false } });
    expect(await screen.findByText("Vennligst vent, du logges ut...")).toBeTruthy();
    expect(screen.queryByLabelText("Email")).toBeNull();
    expect(screen.queryByLabelText("Password")).toBeNull();
  });
});
