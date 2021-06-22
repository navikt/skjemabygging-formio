import { FormMetadataEditor } from "./FormMetadataEditor";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import waitForExpect from "wait-for-expect";
import { FakeBackend } from "../fakeBackend/FakeBackend";
import { AuthContext } from "../context/auth-context";
import AuthenticatedApp from "../AuthenticatedApp";
import { MemoryRouter } from "react-router-dom";
import { UserAlerterContext } from "../userAlerting";
import featureToggles from "../featureToggles.js";
import { AppConfigProvider } from "../configContext";
import { InprocessQuipApp } from "../fakeBackend/InprocessQuipApp";
import { dispatcherWithBackend } from "../fakeBackend/fakeWebApp";
import { Formio } from "formiojs";
import Formiojs from "formiojs/Formio";

describe("FormMetadataEditor", () => {
  let mockOnChange;
  let fakeBackend;

  beforeEach(() => {
    jest.useFakeTimers();
    mockOnChange = jest.fn();
    fakeBackend = new FakeBackend();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should update form when title is changed", async () => {
    const { rerender } = render(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />
      </AppConfigProvider>
    );

    await userEvent.clear(screen.getByRole("textbox", { name: /Tittel/i }));
    const clearedForm = { ...fakeBackend.form(), title: "" };
    await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(clearedForm));

    rerender(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={clearedForm} onChange={mockOnChange} />
      </AppConfigProvider>
    );
    await userEvent.type(screen.getByRole("textbox", { name: /Tittel/i }), "Søknad om førerhund");
    const updatedForm = { ...fakeBackend.form(), title: "Søknad om førerhund" };

    rerender(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
      </AppConfigProvider>
    );
    expect(screen.getByRole("textbox", { name: /Tittel/i })).toHaveValue("Søknad om førerhund");
  });

  it("should display form name", async () => {
    render(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />
      </AppConfigProvider>
    );
    expect(screen.getByRole("textbox", { name: /Navn/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Navn/i }).readOnly).toBe(true);
  });

  it("should update form when display is changed", async () => {
    const { rerender } = render(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />
      </AppConfigProvider>
    );
    expect(screen.getByLabelText(/Vis som/i)).toHaveValue("form");

    await userEvent.selectOptions(screen.getByLabelText(/Vis som/i), "wizard");

    const updatedForm = { ...fakeBackend.form(), display: "wizard" };
    await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

    rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
    expect(screen.getByLabelText(/Vis som/i)).toHaveValue("wizard");
  });

  it("should display form path", async () => {
    render(
      <AppConfigProvider featureToggles={featureToggles}>
        <FormMetadataEditor form={fakeBackend.form()} onChange={mockOnChange} />
      </AppConfigProvider>
    );
    expect(screen.getByRole("textbox", { name: /Path/i })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /Path/i }).readOnly).toBe(true);
  });
  describe("FormMetadataEditor", () => {
    let spy;
    let formioSpy;

    beforeEach(() => {
      spy = jest.spyOn(global, "fetch");
      formioSpy = jest.spyOn(Formiojs, "fetch");
      const fetchAppGlue = new InprocessQuipApp(dispatcherWithBackend(fakeBackend));
      spy.mockImplementation(fetchAppGlue.fetchImpl);
      formioSpy.mockImplementation(fetchAppGlue.fetchImpl);
    });

    afterEach(() => {
      spy.mockReset();
      formioSpy.mockReset();
    });

    it("should display changes when onChange is called", async () => {
      const userAlerter = {
        flashSuccessMessage: jest.fn(),
        alertComponent: jest.fn(),
      };
      render(
        <MemoryRouter initialEntries={[`/forms/${fakeBackend.form().path}/edit`]}>
          <AuthContext.Provider
            value={{
              userData: "fakeUser",
              login: () => {},
              logout: () => {},
            }}
          >
            <UserAlerterContext.Provider value={userAlerter}>
              <AppConfigProvider featureToggles={featureToggles}>
                <AuthenticatedApp
                  formio={new Formio("http://myproject.example.org")}
                  store={{ forms: [fakeBackend.form()] }}
                />
              </AppConfigProvider>
            </UserAlerterContext.Provider>
          </AuthContext.Provider>
        </MemoryRouter>
      );
      let visningsModus = await screen.getByLabelText(/Vis som/i);
      expect(visningsModus).toHaveValue("form");
      await userEvent.selectOptions(visningsModus, "wizard");
      jest.runAllTimers();
      await waitFor(() => expect(visningsModus).toHaveValue("wizard"));
    });
  });
});
