import { AppConfigProvider, supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { v4 as uuidv4 } from "uuid";
//import waitForExpect from "wait-for-expect";
import form from "../../example_data/Form.json";
import mockMottaksadresser from "../fakeBackend/mock-mottaksadresser";
import featureToggles from "../featureToggles.js";
import {
  COMPONENT_TEXTS,
  CreationFormMetadataEditor,
  FormMetadataEditor,
  UpdateFormFunction,
} from "./FormMetadataEditor";

const testform = form as unknown as NavFormType;

jest.mock("../hooks/useMottaksadresser", () => () => {
  return {
    ready: true,
    mottaksadresser: mockMottaksadresser,
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
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should update form when title is changed", async () => {
      const { rerender } = render(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={testform} onChange={mockOnChange} />
        </AppConfigProvider>
      );

      await userEvent.clear(screen.getByRole("textbox", { name: /Tittel/i }));
      const clearedForm: NavFormType = { ...testform, title: "" };
      await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(clearedForm));

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={clearedForm} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      await userEvent.type(screen.getByRole("textbox", { name: /Tittel/i }), "Søknad om førerhund");
      const updatedForm: NavFormType = { ...testform, title: "Søknad om førerhund" };

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      expect(screen.getByRole("textbox", { name: /Tittel/i })).toHaveValue("Søknad om førerhund");
    });

    /*it("should display form name", async () => {
      render(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={testform} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      const navnInput = screen.getByRole("textbox", { name: /Navn/i }) as HTMLInputElement;
      expect(navnInput).toBeVisible();
      expect(navnInput.readOnly).toBe(true);
    });*/

    /*  it("should update form when display is changed", async () => {
      const { rerender } = render(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={testform} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      expect(screen.getByLabelText(/Vis som/i)).toHaveValue("form");

      await userEvent.selectOptions(screen.getByLabelText(/Vis som/i), "wizard");

      const updatedForm = ({ ...testform, display: "wizard" } as unknown) as NavFormType;
      await waitForExpect(() => expect(mockOnChange).toHaveBeenCalledWith(updatedForm));

      rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
      expect(screen.getByLabelText(/Vis som/i)).toHaveValue("wizard");
    });*/

    /*it("should display form path", async () => {
      render(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={testform} onChange={mockOnChange} />
        </AppConfigProvider>
      );
      const pathInput = screen.getByRole("textbox", { name: /Path/i }) as HTMLInputElement;
      expect(pathInput).toBeVisible();
      expect(pathInput.readOnly).toBe(true);
    });*/
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
        skjemanummer: "TST 12.34-56",
        innsending: undefined,
        tema: "BIL",
        enhetMaVelgesVedPapirInnsending: false,
        enhetstyper: [],
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

    const formMedProps = (props: Partial<FormPropertiesType>): NavFormType => ({
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

      it("huker av checkboxer for valgte enhetstyper", () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(creationFormMetadataEditor(form, mockOnChange));
        const checkboxes = screen.getAllByRole("checkbox", { checked: true });
        expect(checkboxes).toHaveLength(4);
      });

      it("fjerner valgt enhet ved klikk", () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(creationFormMetadataEditor(form, mockOnChange));
        userEvent.click(screen.getByRole("checkbox", { name: "LOKAL" }));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetstyper).toEqual(["ALS", "KO"]);
      });

      it("legger til ny valgt enhet ved klikk", () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(creationFormMetadataEditor(form, mockOnChange));
        userEvent.click(screen.getByRole("checkbox", { name: "ARK" }));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetstyper).toEqual(["ALS", "KO", "LOKAL", "ARK"]);
      });

      it("oppdaterer skjemaet med alle støttede enheter hvis enhetstyper er undefined", () => {
        const props = {
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: undefined,
        };
        const form: NavFormType = formMedProps(props);
        render(creationFormMetadataEditor(form, mockOnChange));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(formMedProps({ ...props, enhetstyper: supportedEnhetstyper }));
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
      let form: NavFormType;
      beforeEach(() => {
        form = formMedProps({});
      });

      it("Legger til signatur", () => {
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.queryAllByRole("group", { name: /Signatur \d/ });
        expect(signaturFieldsets).toHaveLength(1);

        const input = within(signaturFieldsets[0]).getByLabelText("Hvem skal signere?");
        userEvent.paste(input, "Lege");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;

        expect(updatedForm.properties.signatures?.[0].label).toEqual("Lege");
      });

      it("legger til ny signatur ved klikk på 'legg til signatur' knapp", () => {
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const knapp = screen.getByRole("button", { name: "Legg til signatur" });
        userEvent.click(knapp);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.signatures?.[0].label).toEqual("");
        expect(updatedForm.properties.signatures?.[0].description).toEqual("");
      });

      it("Slett en signatur", () => {
        const multipleSignatures = [
          {
            label: "Doctor",
            description: "Doctor Description",
            key: "0",
          },
          {
            label: "Test",
            description: "Test Description",
            key: "1",
          },
          {
            label: "Applicant",
            description: "Applicant Description",
            key: "2",
          },
        ];

        form = formMedProps({ signatures: multipleSignatures });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.queryAllByRole("group", { name: /Signatur \d/ });
        expect(signaturFieldsets).toHaveLength(3);

        const lukkKnapp = screen.queryAllByRole("button", { name: "Lukk" })[1];
        userEvent.click(lukkKnapp);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;

        expect(updatedForm.properties.signatures?.[0].label).toEqual("Doctor");
        expect(updatedForm.properties.signatures?.[0].description).toEqual("Doctor Description");
        expect(updatedForm.properties.signatures?.[1].label).toEqual("Applicant");
        expect(updatedForm.properties.signatures?.[1].description).toEqual("Applicant Description");
      });

      it("Legger til beskrivelse for en signatur", () => {
        form = formMedProps({ signatures: [{ label: "Lege", key: "0000" }] });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const signature1Description = screen.getAllByRole("textbox", { name: "Instruksjoner til den som signerer" })[0];
        userEvent.paste(signature1Description, "Jeg bekrefter at personen er syk");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.signatures?.[0].description).toEqual("Jeg bekrefter at personen er syk");
        expect(updatedForm.properties.signatures?.[0].label).toEqual("Lege");
      });
    });

    describe("Beskrivelse av alle signaturene", () => {
      it("settes i properties når tekst legges inn i tekstfelt", () => {
        const form: NavFormType = formMedProps({ signatures: [{ label: "Lege", key: uuidv4() }] });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);

        const input = screen.getByLabelText("Generelle instruksjoner (valgfritt)");
        userEvent.paste(input, "Lang beskrivelse av hvorfor man signerer");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.descriptionOfSignatures).toEqual("Lang beskrivelse av hvorfor man signerer");
      });
    });
  });
});
