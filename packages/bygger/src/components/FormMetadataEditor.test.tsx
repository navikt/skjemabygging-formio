import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import waitForExpect from "wait-for-expect";
import { FakeBackend } from "../fakeBackend/FakeBackend";
import mockMottaksadresser from "../fakeBackend/mock-mottaksadresser";
import featureToggles from "../featureToggles.js";
import { FormPropertiesType, NavFormType } from "../Forms/navForm";
import { fromEntity } from "../hooks/mottaksadresser";
import {
  COMPONENT_TEXTS,
  CreationFormMetadataEditor,
  FormMetadataEditor,
  UpdateFormFunction,
} from "./FormMetadataEditor";

const MOCK_DEFAULT_MOTTAKSADRESSER = mockMottaksadresser.map(fromEntity);
jest.mock("../hooks/useMottaksadresser", () => () => {
  return {
    ready: true,
    mottaksadresser: MOCK_DEFAULT_MOTTAKSADRESSER,
    errorMessage: undefined,
  };
});

jest.mock("react-router-dom", () => ({
  // @ts-ignore
  ...jest.requireActual("react-router-dom"),
  Link: () => <a href="/">testlink</a>,
}));

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
      display: "wizard",
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
      const formMedDownloadPdfButtonText = (downloadPdfButtonText) => ({
        ...defaultForm,
        properties: {
          ...defaultForm.properties,
          downloadPdfButtonText,
        },
      });

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

    const formMedProps = (props: Partial<FormPropertiesType>) => ({
      ...defaultForm,
      properties: {
        ...defaultForm.properties,
        ...props,
      },
    });

    describe("Mottaksadresse", () => {
      describe("Dropdown med mottaksadresser", () => {
        it("Vises ikke når innsending=INGEN", async () => {
          const form: NavFormType = formMedProps({ innsending: "INGEN" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeFalsy();
        });

        it("Vises ikke når innsending=KUN_DIGITAL", async () => {
          const form: NavFormType = formMedProps({ innsending: "KUN_DIGITAL" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeFalsy();
        });

        it("Vises når innsending=KUN_PAPIR", async () => {
          const form: NavFormType = formMedProps({ innsending: "KUN_PAPIR" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Vises når innsending=PAPIR_OG_DIGITAL", async () => {
          const form: NavFormType = formMedProps({ innsending: "PAPIR_OG_DIGITAL" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Vises når innsending=undefined", async () => {
          const form: NavFormType = formMedProps({ innsending: undefined });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Viser valgt mottaksadresse med formattering", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: "1" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.getByDisplayValue("NAV alternativ skanning, Postboks 3, 0591 Oslo")).toBeTruthy();
        });
      });

      describe("Endring av mottaksadresse", () => {
        it("Setter ny mottaksadresse", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: undefined });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "1");

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
          expect(updatedForm.properties.mottaksadresseId).toEqual("1");
        });

        it("Fjerner valgt mottaksadresse", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: "1" });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
          userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "");

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
          expect(updatedForm.properties.mottaksadresseId).toBeUndefined();
        });
      });
    });

    describe("Innstilling for valg av enhet ved papirinnsending", () => {
      const creationFormMetadataEditor = (form, onChange) => (
        <AppConfigProvider featureToggles={{ ...featureToggles, enableEnhetsListe: true }}>
          <CreationFormMetadataEditor form={form} onChange={onChange} />
        </AppConfigProvider>
      );

      it("Vises når innsending=KUN_PAPIR", async () => {
        const form: NavFormType = formMedProps({
          innsending: "KUN_PAPIR",
          mottaksadresseId: undefined,
        });
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeTruthy();
      });

      it("Vises når innsending=PAPIR_OG_DIGITAL", async () => {
        const form: NavFormType = formMedProps({ innsending: "PAPIR_OG_DIGITAL" });
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeTruthy();
      });

      it("Vises ikke når innsending=INGEN", async () => {
        const form: NavFormType = formMedProps({ innsending: "INGEN" });
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeFalsy();
      });

      it("Vises ikke når innsending=KUN_DIGITAL", async () => {
        const form: NavFormType = formMedProps({ innsending: "KUN_DIGITAL" });
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeFalsy();
      });

      it("Kan endres til true ved klikk på checkbox", () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: false });
        const { rerender } = render(creationFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole("checkbox", {
          name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR,
        });
        expect(checkbox).not.toBeChecked();
        userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(true);

        rerender(creationFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole("checkbox", {
          name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR,
        });
        expect(checkbox).toBeChecked();
      });

      it("Kan endres til false ved klikk på checkbox", () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(creationFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole("checkbox", {
          name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR,
        });
        expect(checkbox).toBeChecked();
        userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(creationFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole("checkbox", {
          name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR,
        });
        expect(checkbox).not.toBeChecked();
      });

      it("Nullstilles og skjules når mottaksadresse velges", () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(creationFormMetadataEditor(form, mockOnChange));
        userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "1");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.mottaksadresseId).toEqual("1");
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(creationFormMetadataEditor(updatedForm, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeFalsy();
      });

      it("Er skjult når mottaksadresse er valgt", () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: "1", enhetMaVelgesVedPapirInnsending: true });
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(
          screen.queryByRole("checkbox", { name: COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR })
        ).toBeFalsy();
      });
    });

    describe("Signaturer", () => {
      it("Viser felter for å legge inn signaturer når checkbox velges", () => {
        const form: NavFormType = formMedProps({ hasLabeledSignatures: false });
        const { rerender } = render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        expect(screen.queryAllByRole("group", { name: "Signeres av" })).toHaveLength(0);
        userEvent.click(screen.getByRole("checkbox", { name: "Skjemaet skal ha mer enn ett signaturfelt" }));

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.hasLabeledSignatures).toBe(true);

        rerender(<CreationFormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
        expect(screen.queryAllByRole("group", { name: "Signeres av" })).toHaveLength(5);
      });

      it("Legger til signatur", () => {
        const form: NavFormType = formMedProps({ hasLabeledSignatures: true, signatures: {} });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        const signaturFieldsets = screen.queryAllByRole("group", { name: "Signeres av" });
        expect(signaturFieldsets).toHaveLength(5);

        const input = within(signaturFieldsets[0]).getByLabelText("Hvem");
        userEvent.paste(input, "Lege");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.hasLabeledSignatures).toBe(true);
        expect(updatedForm.properties.signatures?.signature1).toEqual("Lege");
      });

      it("Legger til beskrivelse for en signatur", () => {
        const form: NavFormType = formMedProps({ hasLabeledSignatures: true, signatures: { signature1: "Lege" } });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const signature1Description = screen.getByTestId("signature1Description");
        userEvent.paste(signature1Description, "Jeg bekrefter at personen er i live");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.hasLabeledSignatures).toBe(true);
        expect(updatedForm.properties.signatures?.signature1).toEqual("Lege");
        expect(updatedForm.properties.signatures?.signature1Description).toEqual("Jeg bekrefter at personen er i live");
      });

      it("Nullstiller alle felter relatert til signaturer når man velger at skjemaet ikke skal ha mer enn ett signaturfelt", () => {
        const form: NavFormType = formMedProps({
          hasLabeledSignatures: true,
          descriptionOfSignatures: "Lang beskrivelse",
          signatures: {
            signature1: "Lege",
            signature1Description: "Jeg bekrefter at personen er syk",
          },
        });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const checkbox = screen.getByLabelText("Skjemaet skal ha mer enn ett signaturfelt");
        userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.hasLabeledSignatures).toBe(false);
        expect(updatedForm.properties.descriptionOfSignatures).toBeUndefined();
        expect(updatedForm.properties.signatures).toBeUndefined();
      });

      describe("Beskrivelse av alle signaturene", () => {
        it("tekstfelt vises ikke dersom checkbox ikke er valgt", () => {
          const form: NavFormType = formMedProps({ hasLabeledSignatures: false });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

          const input = screen.queryByLabelText("Beskrivelse for alle signaturer (valgfritt)");
          expect(input).not.toBeInTheDocument();
        });

        it("settes i properties når tekst legges inn i tekstfelt", () => {
          const form: NavFormType = formMedProps({ hasLabeledSignatures: true, signatures: { signature1: "Lege" } });
          render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

          const input = screen.getByLabelText("Beskrivelse for alle signaturer (valgfritt)");
          userEvent.paste(input, "Lang beskrivelse av hvorfor man signerer");

          expect(mockOnChange).toHaveBeenCalled();
          const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
          expect(updatedForm.properties.descriptionOfSignatures).toEqual("Lang beskrivelse av hvorfor man signerer");
        });
      });
    });
  });
});
