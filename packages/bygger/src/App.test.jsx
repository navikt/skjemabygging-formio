import { AppConfigProvider, NavFormioJs } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import createMockImplementation, { DEFAULT_PROJECT_URL } from "../test/backendMockImplementation";
import featureToggles from "../test/featureToggles";
import App from "./App";
import { AuthContext } from "./context/auth-context";

const createFakeChannel = () => ({
  bind: vi.fn(),
  unbind: vi.fn(),
});

describe("App", () => {
  let formioFetch;
  beforeEach(() => {
    formioFetch = vi.spyOn(NavFormioJs.Formio, "fetch");
    formioFetch.mockImplementation(createMockImplementation());
  });

  afterEach(() => {
    formioFetch.mockClear();
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
            <App projectURL={DEFAULT_PROJECT_URL} pusher={{ subscribe: () => createFakeChannel() }} />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  // TODO: Fix
  test.skip("Show login form in development", async () => {
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
