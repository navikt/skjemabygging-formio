import { CreationFormMetadataEditor, FormMetadataEditor, UpdateFormFunction } from "./FormMetadataEditor";
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
import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { InprocessQuipApp } from "../fakeBackend/InprocessQuipApp";
import { dispatcherWithBackend } from "../fakeBackend/fakeWebApp";
import { Formio } from "formiojs";
import Formiojs from "formiojs/Formio";
import { NavFormType } from "../Forms/navForm";

describe("FormMetadataEditor", () => {
  let mockOnChange: jest.MockedFunction<UpdateFormFunction>;

  beforeEach(() => {
    mockOnChange = jest.fn();
  });

  describe("Usage context: EDIT", () => {
    let fakeBackend;

    beforeEach(() => {
      jest.useFakeTimers();
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
      const clearedForm: NavFormType = { ...fakeBackend.form(), title: "" };
      await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(clearedForm));

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={clearedForm} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      await userEvent.type(screen.getByRole("textbox", { name: /Tittel/i }), "Søknad om førerhund");
      const updatedForm: NavFormType = { ...fakeBackend.form(), title: "Søknad om førerhund" };

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
      const navnInput = screen.getByRole("textbox", { name: /Navn/i }) as HTMLInputElement;
      expect(navnInput).toBeVisible();
      expect(navnInput.readOnly).toBe(true);
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
      const pathInput = screen.getByRole("textbox", { name: /Path/i }) as HTMLInputElement;
      expect(pathInput).toBeVisible();
      expect(pathInput.readOnly).toBe(true);
    });

    describe("FormMetadataEditor", () => {
      let spy;
      let formioSpy;

      beforeEach(() => {
        // @ts-ignore
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
                    serverURL={"http://myproject.example.org"}
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

  describe("Usage context: CREATE", () => {
    const defaultForm: NavFormType = {
      title: "Testskjema",
      name: "testskjema",
      path: "tst123456",
      tags: ["nav-skjema", ""],
      type: "form",
      components: [],
      properties: {
        hasPapirInnsendingOnly: undefined,
        skjemanummer: "TST 12.34-56",
        innsending: undefined,
        tema: "BIL",
        hasLabeledSignatures: false,
      },
      display: "wizard"
    };

    describe("Forklaring til innsending", () => {

      it("Viser input for forklaring når innsending settes til INGEN", async () => {
        const { rerender } = render(<CreationFormMetadataEditor form={defaultForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
        userEvent.selectOptions(screen.getByLabelText("Innsending"), "INGEN");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.innsending).toEqual("INGEN");

        rerender(<CreationFormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).not.toBeNull();
      });

      it("Input for forklaring til innsending skjules når man velger noe annet enn INGEN", async () => {
        const form: NavFormType = {
          ...defaultForm,
          properties: {
            ...defaultForm.properties,
            innsending: "INGEN",
          },
        };
        const { rerender } = render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).not.toBeNull();
        userEvent.selectOptions(screen.getByLabelText("Innsending"), "KUN_PAPIR");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.innsending).toEqual("KUN_PAPIR");

        rerender(<CreationFormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
      });
    });

    })

    it("Valg av innsending=KUN_PAPIR", async () => {
      const form: NavFormType = {
        ...defaultForm,
        properties: {
          ...defaultForm.properties,
          innsending: "PAPIR_OG_DIGITAL",
        },
      };
      const { rerender } = render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
      expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
      userEvent.selectOptions(screen.getByLabelText("Innsending"), "KUN_PAPIR");

      expect(mockOnChange).toHaveBeenCalled();
      const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
      expect(updatedForm.properties.innsending).toEqual("KUN_PAPIR");

      rerender(<CreationFormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
      expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
    });

    describe("Egendefinert tekst på knapp for nedlasting av pdf", () => {

      const formMedDownloadPdfButtonText = downloadPdfButtonText => ({
        ...defaultForm,
        properties: {
          ...defaultForm.properties,
          downloadPdfButtonText,
        }
      })

      it("lagres i properties", async () => {
        const form = formMedDownloadPdfButtonText(undefined);
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Tekst på knapp for nedlasting av pdf");
        await userEvent.paste(input, "Last ned pdf");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.downloadPdfButtonText).toEqual("Last ned pdf");
      });

      it("nullstilles i properties", async () => {
        const form = formMedDownloadPdfButtonText("Last meg ned");
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Tekst på knapp for nedlasting av pdf");
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.downloadPdfButtonText).toEqual("");
      });

    });

  });
});
