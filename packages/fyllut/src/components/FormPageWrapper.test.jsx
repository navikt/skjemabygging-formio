import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter, Route } from "react-router-dom";
import { FormPageWrapper } from "./FormPageWrapper";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json",
  },
};

describe("FormPageWrapper", () => {
  beforeEach(() => {
    fetchMock.doMock();
  });

  afterEach(() => fetchMock.resetMocks());

  it("Show loading when fetching a form from backend and no form founded when there is no form fetched", async () => {
    fetchMock.mockImplementation((url) => {
      if (url === "/fyllut/forms/unknownForm") {
        return Promise.resolve(new Response("", { ...RESPONSE_HEADERS, status: 404 }));
      }
      throw new Error("Unknown URL: " + url);
    });

    render(
      <MemoryRouter initialEntries={["/fyllut/forms/unknownForm"]}>
        <Route path="/fyllut/forms/:formPath">
          <FormPageWrapper />
        </Route>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Laster...",
      })
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Fant ikke siden" })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toEqual(""));
  });

  it.skip("Show target form when there is one", async () => {
    const mockedForm = {
      _id: "000",
      path: "newform",
      title: "New form",
      modified: "2021-11-30T14:10:21.487Z",
      components: [],
    };
    fetchMock.mockImplementation((url) => {
      if (url === "/fyllut/forms/knownForm") {
        return Promise.resolve(new Response(JSON.stringify(mockedForm), RESPONSE_HEADERS));
      }
      throw new Error("Unknown URL: " + url);
    });

    render(
      <MemoryRouter initialEntries={["/fyllut/forms/knownForm"]}>
        <AppConfigProvider featureToggles={{}}>
          <Route path="/fyllut/forms/:formPath">
            <FormPageWrapper />
          </Route>
        </AppConfigProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(document.title).toEqual("New form | www.nav.no"));
  });
});
