import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter, Route } from "react-router-dom";
import { FormPageWrapper } from "./FormPageWrapper";

describe("FormPageWrapper", () => {
  afterEach(() => fetchMock.resetMocks());

  it("Show loading when fetching a form from backend and no form founded when there is no form fetched", async () => {
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response());
    });

    render(
      <MemoryRouter initialEntries={["/fyllut/forms/newForm"]}>
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
    expect(await screen.findByRole("heading", { name: "Finner ikke skjemaet newForm" })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toEqual(""));
  });

  it("Show target form when there is one", async () => {
    const mockedForm = {
      _id: "000",
      path: "newform",
      title: "New form",
      modified: "2021-11-30T14:10:21.487Z",
      components: [],
    };
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify(mockedForm)));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut/forms/newForm"]}>
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
