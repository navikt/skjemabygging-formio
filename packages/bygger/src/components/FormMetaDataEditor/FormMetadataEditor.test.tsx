import { AppConfigProvider } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, NavFormType, supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-domain";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { v4 as uuidv4 } from "uuid";
import form from "../../../example_data/Form.json";
import featureToggles from "../../../test/featureToggles";
import mockMottaksadresser from "../../fakeBackend/mock-mottaksadresser";
import { CreationFormMetadataEditor, FormMetadataEditor } from "./FormMetadataEditor";
import { UpdateFormFunction } from "./utils";

const testform = form as unknown as NavFormType;

vi.mock("../../hooks/useMottaksadresser", () => {
  return {
    default: () => ({
      ready: true,
      mottaksadresser: mockMottaksadresser,
      errorMessage: undefined,
    }),
  };
});
vi.mock("../../hooks/useTemaKoder", () => {
  return {
    default: () => ({
      ready: true,
      temaKoder: [
        { key: "ABC", value: "Tema 1" },
        { key: "XYZ", value: "Tema 3" },
        { key: "DEF", value: "Tema 2" },
      ],
      errorMessage: undefined,
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<object>("react-router-dom");
  return {
    ...actual,
    Link: () => <a href="/">testlink</a>,
  };
});

const defaultForm: NavFormType = {
  title: "Testskjema",
  name: "testskjema",
  path: "tst123456",
  tags: ["nav-skjema", ""],
  type: "form",
  components: [],
  properties: {
    skjemanummer: "TST 12.34-56",
    innsending: "PAPIR_OG_DIGITAL",
    tema: "BIL",
    enhetMaVelgesVedPapirInnsending: false,
    enhetstyper: [],
    signatures: [
      {
        label: "",
        description: "",
        key: "ddade517-86c6-4f1e-b730-a477e01dc245",
      },
    ],
  },
  display: "wizard",
};

const formMedProps = (props: Partial<FormPropertiesType>): NavFormType => ({
  ...defaultForm,
  properties: {
    ...defaultForm.properties,
    ...props,
  },
});

describe("FormMetadataEditor", () => {
  let mockOnChange;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe("Usage context: EDIT", () => {
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

    describe("Forklaring til innsending", () => {
      it("Viser input for forklaring når innsending settes til INGEN", async () => {
        const { rerender } = render(<FormMetadataEditor form={defaultForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
        await userEvent.selectOptions(screen.getByLabelText("Innsending"), "INGEN");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.innsending).toEqual("INGEN");

        rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
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
        const { rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.queryByLabelText("Forklaring til innsending")).not.toBeNull();
        await userEvent.selectOptions(screen.getByLabelText("Innsending"), "KUN_PAPIR");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.innsending).toEqual("KUN_PAPIR");

        rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
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
      const { rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
      expect(screen.queryByLabelText("Forklaring til innsending")).toBeNull();
      await userEvent.selectOptions(screen.getByLabelText("Innsending"), "KUN_PAPIR");

      expect(mockOnChange).toHaveBeenCalled();
      const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
      expect(updatedForm.properties.innsending).toEqual("KUN_PAPIR");

      rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
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
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Tekst på knapp for nedlasting av pdf");
        await userEvent.click(input);
        await userEvent.paste("Last ned pdf");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.downloadPdfButtonText).toEqual("Last ned pdf");
      });

      it("nullstilles i properties", async () => {
        const form = formMedDownloadPdfButtonText("Last meg ned");
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Tekst på knapp for nedlasting av pdf");
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.downloadPdfButtonText).toEqual("");
      });
    });
    describe("Ettersendelsesfrist", () => {
      it("lagres i properties", async () => {
        const form = formMedProps({ ettersendelsesfrist: undefined, ettersending: "KUN_DIGITAL" });

        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Ettersendelsesfrist (dager)");
        await userEvent.click(input);
        await userEvent.paste("42");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.ettersendelsesfrist).toEqual("42");
      });

      it("nullstilles i properties", async () => {
        const form = formMedProps({ ettersendelsesfrist: "42", ettersending: "KUN_DIGITAL" });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText("Ettersendelsesfrist (dager)");
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.ettersendelsesfrist).toEqual("");
      });
    });

    describe("Mottaksadresse", () => {
      describe("Dropdown med mottaksadresser", () => {
        it("Vises ikke når innsending=INGEN", async () => {
          const form: NavFormType = formMedProps({ innsending: "INGEN" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeFalsy();
        });

        it("Vises ikke når innsending=KUN_DIGITAL", async () => {
          const form: NavFormType = formMedProps({ innsending: "KUN_DIGITAL" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeFalsy();
        });

        it("Vises når innsending=KUN_PAPIR", async () => {
          const form: NavFormType = formMedProps({ innsending: "KUN_PAPIR" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Vises når innsending=PAPIR_OG_DIGITAL", async () => {
          const form: NavFormType = formMedProps({ innsending: "PAPIR_OG_DIGITAL" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Vises når innsending=undefined", async () => {
          const form: NavFormType = formMedProps({ innsending: undefined });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText("Mottaksadresse")).toBeTruthy();
        });

        it("Viser valgt mottaksadresse med formattering", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: "1" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.getByDisplayValue("NAV alternativ skanning, Postboks 3, 0591 Oslo")).toBeTruthy();
        });
      });

      describe("Endring av mottaksadresse", () => {
        it("Setter ny mottaksadresse", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: undefined });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "1");

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
          expect(updatedForm.properties.mottaksadresseId).toEqual("1");
        });

        it("Fjerner valgt mottaksadresse", async () => {
          const form: NavFormType = formMedProps({ mottaksadresseId: "1" });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "");

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
          expect(updatedForm.properties.mottaksadresseId).toBeUndefined();
        });
      });
    });

    describe("Innstilling for valg av enhet ved papirinnsending", () => {
      const expectedCheckboxName = "Bruker må velge enhet ved innsending på papir";
      const editFormMetadataEditor = (form: NavFormType, onChange: UpdateFormFunction) => (
        <AppConfigProvider featureToggles={{ ...featureToggles, enableEnhetsListe: true }}>
          <FormMetadataEditor form={form} onChange={onChange} />
        </AppConfigProvider>
      );

      it("Vises når innsending=KUN_PAPIR", async () => {
        const form: NavFormType = formMedProps({
          innsending: "KUN_PAPIR",
          mottaksadresseId: undefined,
        });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeTruthy();
      });

      it("Vises når innsending=PAPIR_OG_DIGITAL", async () => {
        const form: NavFormType = formMedProps({ innsending: "PAPIR_OG_DIGITAL" });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeTruthy();
      });

      it("Vises ikke når innsending=INGEN", async () => {
        const form: NavFormType = formMedProps({ innsending: "INGEN" });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeFalsy();
      });

      it("Vises ikke når innsending=KUN_DIGITAL", async () => {
        const form: NavFormType = formMedProps({ innsending: "KUN_DIGITAL" });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeFalsy();
      });

      it("Kan endres til true ved klikk på checkbox", async () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: false });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole("checkbox", {
          name: expectedCheckboxName,
        });
        expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(true);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole("checkbox", {
          name: expectedCheckboxName,
        });
        expect(checkbox).toBeChecked();
      });

      it("Kan endres til false ved klikk på checkbox", async () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole("checkbox", {
          name: expectedCheckboxName,
        });
        expect(checkbox).toBeChecked();
        await userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole("checkbox", {
          name: expectedCheckboxName,
        });
        expect(checkbox).not.toBeChecked();
      });

      it("huker av checkboxer for valgte enhetstyper", () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        const checkboxes = screen.getAllByRole("checkbox", { checked: true });
        expect(checkboxes).toHaveLength(4);
      });

      it("fjerner valgt enhet ved klikk", async () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.click(screen.getByRole("checkbox", { name: "LOKAL" }));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.enhetstyper).toEqual(["ALS", "KO"]);
      });

      it("legger til ny valgt enhet ved klikk", async () => {
        const form: NavFormType = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ["ALS", "KO", "LOKAL"],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.click(screen.getByRole("checkbox", { name: "ARK" }));
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
        render(editFormMetadataEditor(form, mockOnChange));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(formMedProps({ ...props, enhetstyper: supportedEnhetstyper }));
      });

      it("Nullstilles og skjules når mottaksadresse velges", async () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.selectOptions(screen.getByLabelText("Mottaksadresse"), "1");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.mottaksadresseId).toEqual("1");
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeFalsy();
      });

      it("Er skjult når mottaksadresse er valgt", () => {
        const form: NavFormType = formMedProps({ mottaksadresseId: "1", enhetMaVelgesVedPapirInnsending: true });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole("checkbox", { name: expectedCheckboxName })).toBeFalsy();
      });
    });

    describe("Signaturer", () => {
      let form: NavFormType;
      beforeEach(() => {
        form = formMedProps({});
      });

      it("Legger til signatur", async () => {
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.getAllByTestId("signatures");
        expect(signaturFieldsets).toHaveLength(1);

        const input = within(signaturFieldsets[0]).getByLabelText("Hvem skal signere?");
        await userEvent.click(input);
        await userEvent.paste("Lege");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;

        expect(updatedForm.properties.signatures?.[0].label).toEqual("Lege");
      });

      it("legger til ny signatur ved klikk på 'legg til signatur' knapp", async () => {
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const knapp = screen.getByRole("button", { name: "Legg til signatur" });
        await userEvent.click(knapp);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.signatures?.[0].label).toEqual("");
        expect(updatedForm.properties.signatures?.[0].description).toEqual("");
      });

      it("Slett en signatur", async () => {
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
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.getAllByTestId("signatures");
        expect(signaturFieldsets).toHaveLength(3);
        const lukkKnapp = screen.getByRole("button", { name: "Slett signatur 2" });
        await userEvent.click(lukkKnapp);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;

        expect(updatedForm.properties.signatures?.[0].label).toEqual("Doctor");
        expect(updatedForm.properties.signatures?.[0].description).toEqual("Doctor Description");
        expect(updatedForm.properties.signatures?.[1].label).toEqual("Applicant");
        expect(updatedForm.properties.signatures?.[1].description).toEqual("Applicant Description");
      });

      it("Legger til beskrivelse for en signatur", async () => {
        form = formMedProps({ signatures: [{ label: "Lege", key: "0000" }] });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signature1Description = screen.getAllByRole("textbox", { name: "Instruksjoner til den som signerer" })[0];
        await userEvent.click(signature1Description);
        await userEvent.paste("Jeg bekrefter at personen er syk");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.signatures?.[0].description).toEqual("Jeg bekrefter at personen er syk");
        expect(updatedForm.properties.signatures?.[0].label).toEqual("Lege");
      });
    });

    describe("Beskrivelse av alle signaturene", () => {
      it("settes i properties når tekst legges inn i tekstfelt", async () => {
        const form: NavFormType = formMedProps({ signatures: [{ label: "Lege", key: uuidv4() }] });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const input = screen.getByLabelText("Generelle instruksjoner (valgfritt)");
        await userEvent.click(input);
        await userEvent.paste("Lang beskrivelse av hvorfor man signerer");

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.descriptionOfSignatures).toEqual("Lang beskrivelse av hvorfor man signerer");
      });
    });
  });

  describe("Usage context: CREATE", () => {
    describe("Tema", () => {
      it("lister ut temaer", () => {
        render(<CreationFormMetadataEditor form={defaultForm} onChange={mockOnChange} />);
        const temaSelect = screen.getByRole("combobox", { name: "Tema" });
        const options = within(temaSelect).queryAllByRole("option");
        expect(options).toHaveLength(4);
        expect(options[1]).toHaveTextContent("Tema 1 (ABC)");
        expect(options[2]).toHaveTextContent("Tema 3 (XYZ)");
        expect(options[3]).toHaveTextContent("Tema 2 (DEF)");
      });

      it("setter valgt tema hvis temakoden finnes blant valgene", () => {
        const form = formMedProps({ tema: "DEF" });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("DEF");
      });

      it("setter valg til default verdi hvis temakoden ikke eksisterer", () => {
        const form = formMedProps({ tema: "JKL" });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("");
      });

      it("oppdaterer skjema når bruker velger et nytt tema", async () => {
        const form: NavFormType = formMedProps({ tema: "ABC" });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        await userEvent.selectOptions(screen.getByRole("combobox", { name: "Tema" }), "XYZ");

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as NavFormType;
        expect(updatedForm.properties.tema).toEqual("XYZ");
      });
    });
  });
});
