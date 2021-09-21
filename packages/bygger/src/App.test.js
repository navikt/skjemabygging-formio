import React from "react";
import {render, screen} from '@testing-library/react';
import App from "./App";
import {AuthContext} from "./context/auth-context";
import featureToggles from "./featureToggles";
import {AppConfigProvider} from "@navikt/skjemadigitalisering-shared-components";
import {MemoryRouter} from "react-router-dom";
import {InprocessQuipApp} from "./fakeBackend/InprocessQuipApp";
import {dispatcherWithBackend} from "./fakeBackend/fakeWebApp";
import {FakeBackend} from "./fakeBackend/FakeBackend";
import fetchMock from "jest-fetch-mock";

const createFakeChannel = () => ({
  bind: jest.fn(),
  unbind: jest.fn(),
});

describe('App', () => {

  beforeEach(() => {
    const mockBackend = new InprocessQuipApp(dispatcherWithBackend(new FakeBackend()));
    fetchMock.mockImplementation(mockBackend.fetchImpl);
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  test('Redirect til login form', async () => {
    const formStore = {forms: null};
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthContext.Provider
          value={{
            userData: null,
            login: () => {},
            logout: () => {},
          }}
        >
          <AppConfigProvider featureToggles={featureToggles}>
            <App
              store={formStore}
              projectURL="http://myproject.example.org"
              pusher={{ subscribe: () => createFakeChannel() }}
            />
          </AppConfigProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(await screen.findByLabelText("Email")).toBeTruthy();
    expect(await screen.findByLabelText("Password")).toBeTruthy();
  });

});
