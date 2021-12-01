import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { FormPageWrapper } from "./FormPageWrapper";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useRouteMatch: () => ({ params: { formpath: "newForm" } }),
}));

describe("FormPageWrapper", () => {
  afterEach(() => fetchMock.resetMocks());

  it("Show loading when fetching a form from backend", async () => {
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify([])));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut/forms/newForm"]}>
        <FormPageWrapper />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Laster..." })).toBeInTheDocument();
  });

  it("Show no form founded when there is no form from backend", async () => {
    fetchMock.mockImplementation((url) => {
      return Promise.resolve(new Response(JSON.stringify([])));
    });

    render(
      <MemoryRouter initialEntries={["/fyllut"]}>
        <FormPageWrapper />
      </MemoryRouter>
    );
    expect(await screen.findByRole("heading", { name: "Finner ikke skjemaet newForm" })).toBeInTheDocument();
  });
});
