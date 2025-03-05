import { AppConfigProvider } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormPropertiesType, supportedEnhetstyper } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import form from '../../../example_data/Form.json';
import featureToggles from '../../../test/featureToggles';
import mockRecipients from '../../fakeBackend/mock-recipients';
import { CreationFormMetadataEditor, FormMetadataEditor } from './FormMetadataEditor';
import { UpdateFormFunction } from './utils/utils';

const testform = form as unknown as Form;

vi.mock('../../context/recipients/RecipientsContext', () => {
  return {
    useRecipients: () => ({
      isReady: true,
      recipients: mockRecipients,
    }),
  };
});
vi.mock('../../api/useTemaKoder', () => {
  return {
    default: () => ({
      ready: true,
      temaKoder: [
        { key: 'ABC', value: 'Tema 1' },
        { key: 'XYZ', value: 'Tema 3' },
        { key: 'DEF', value: 'Tema 2' },
      ],
      errorMessage: undefined,
    }),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  return {
    ...actual,
    Link: () => <a href="/">testlink</a>,
  };
});

const defaultForm: Form = {
  title: 'Testskjema',
  skjemanummer: 'TST 12.34-56',
  // name: 'testskjema',
  path: 'tst123456',
  // tags: ['nav-skjema', ''],
  // type: 'form',
  components: [],
  properties: {
    skjemanummer: 'TST 12.34-56',
    submissionTypes: ['PAPER', 'DIGITAL'],
    tema: 'BIL',
    enhetMaVelgesVedPapirInnsending: false,
    enhetstyper: [],
    signatures: [
      {
        label: '',
        description: '',
        key: 'ddade517-86c6-4f1e-b730-a477e01dc245',
      },
    ],
    mellomlagringDurationDays: '28',
  },
  // display: 'wizard',
};

const formMedProps = (props: Partial<FormPropertiesType>): Form => ({
  ...defaultForm,
  properties: {
    ...defaultForm.properties,
    ...props,
  },
});

describe('FormMetadataEditor', () => {
  let mockOnChange;

  beforeEach(() => {
    mockOnChange = vi.fn();
  });

  describe('Usage context: EDIT', () => {
    it('should update form when title is changed', async () => {
      const { rerender } = render(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={testform} onChange={mockOnChange} />
        </AppConfigProvider>,
      );

      await userEvent.clear(screen.getByRole('textbox', { name: /Tittel/i }));
      const clearedForm: Form = { ...testform, title: '' };
      await waitFor(() => expect(mockOnChange).toHaveBeenCalledWith(clearedForm));

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={clearedForm} onChange={mockOnChange} />
        </AppConfigProvider>,
      );
      await userEvent.type(screen.getByRole('textbox', { name: /Tittel/i }), 'Søknad om førerhund');
      const updatedForm: Form = { ...testform, title: 'Søknad om førerhund' };

      rerender(
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
        </AppConfigProvider>,
      );
      expect(screen.getByRole('textbox', { name: /Tittel/i })).toHaveValue('Søknad om førerhund');
    });

    describe('Forklaring til innsending', () => {
      it('Viser input for forklaring når submissionTypes settes til []', async () => {
        const form: Form = {
          ...defaultForm,
          properties: {
            ...defaultForm.properties,
            submissionTypes: ['DIGITAL'],
          },
        };
        const { rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const checkbox = screen.getByRole('checkbox', { name: 'Digital' });
        await userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        await waitFor(() => {
          expect(updatedForm.properties.submissionTypes).toStrictEqual([]);
        });

        rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText('Forklaring til innsending')).not.toBeNull();
      });

      it('Input for forklaring til innsending skjules når man velger en', async () => {
        const form: Form = {
          ...defaultForm,
          properties: {
            ...defaultForm.properties,
            submissionTypes: [],
          },
        };
        const { rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.queryByLabelText('Forklaring til innsending')).not.toBeNull();

        const kunPapirCheckbox = screen.getByRole('checkbox', { name: 'Papir' });
        await userEvent.click(kunPapirCheckbox);

        await expect(mockOnChange).toHaveBeenCalled();

        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.submissionTypes).toStrictEqual(['PAPER']);

        rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
        expect(screen.queryByLabelText('Forklaring til innsending')).toBeNull();
      });
    });

    it('Valg av submissionTypes=[PAPER]', async () => {
      const form: Form = {
        ...defaultForm,
        properties: {
          ...defaultForm.properties,
          submissionTypes: [],
        },
      };
      const { rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
      expect(screen.queryByLabelText('Forklaring til submissionTypes')).toBeNull();
      await userEvent.click(screen.getByRole('checkbox', { name: /Papir/ }));

      expect(mockOnChange).toHaveBeenCalled();
      const updatedForm = mockOnChange.mock.calls[0][0] as Form;
      expect(updatedForm.properties.submissionTypes).toStrictEqual(['PAPER']);

      rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);
      expect(screen.queryByLabelText('Forklaring til submissionTypes')).toBeNull();
    });

    describe('Egendefinert tekst på knapp for nedlasting av pdf', () => {
      const formMedDownloadPdfButtonText = (downloadPdfButtonText) => ({
        ...defaultForm,
        properties: {
          ...defaultForm.properties,
          downloadPdfButtonText,
        },
      });

      it('lagres i properties', async () => {
        const form = formMedDownloadPdfButtonText(undefined);
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Tekst på knapp for nedlasting av pdf');
        await userEvent.click(input);
        await userEvent.paste('Last ned pdf');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.downloadPdfButtonText).toBe('Last ned pdf');
      });

      it('nullstilles i properties', async () => {
        const form = formMedDownloadPdfButtonText('Last meg ned');
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Tekst på knapp for nedlasting av pdf');
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.downloadPdfButtonText).toBe('');
      });
    });

    describe('Ettersendelsesfrist', () => {
      it('lagres i properties', async () => {
        const form = formMedProps({ ettersendelsesfrist: undefined, ettersending: 'KUN_DIGITAL' });

        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Ettersendelsesfrist (dager)');
        await userEvent.click(input);
        await userEvent.paste('42');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.ettersendelsesfrist).toBe('42');
      });

      it('nullstilles i properties', async () => {
        const form = formMedProps({ ettersendelsesfrist: '42', ettersending: 'KUN_DIGITAL' });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Ettersendelsesfrist (dager)');
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.ettersendelsesfrist).toBe('');
      });
    });

    describe('mellomlagringDurationDays', () => {
      it('is saved in properties', async () => {
        const form = formMedProps({ mellomlagringDurationDays: undefined, ettersending: 'KUN_DIGITAL' });

        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Mellomlagringstid (dager)');
        await userEvent.click(input);
        await userEvent.paste('42');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.mellomlagringDurationDays).toBe('42');
      });
    });

    describe('Mottaksadresse', () => {
      describe('Dropdown med mottaksadresser', () => {
        it('Vises ikke når submissionTypes=INGEN', async () => {
          const form: Form = formMedProps({ submissionTypes: [] });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeFalsy();
        });

        it('Vises ikke når submissionTypes=KUN_DIGITAL', async () => {
          const form: Form = formMedProps({ submissionTypes: ['DIGITAL'] });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeFalsy();
        });

        it('Vises når submissionTypes=[PAPER]', async () => {
          const form: Form = formMedProps({ submissionTypes: ['PAPER'] });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeTruthy();
        });

        it('Vises når submissionTypes=[PAPER, DIGITAL]', async () => {
          const form: Form = formMedProps({ submissionTypes: ['PAPER', 'DIGITAL'] });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeTruthy();
        });

        it('Viser valgt mottaksadresse med formattering', async () => {
          const form: Form = formMedProps({ mottaksadresseId: '1' });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.getByDisplayValue('Nav alternativ skanning, Postboks 3, 0591 Oslo')).toBeTruthy();
        });
      });

      describe('Endring av mottaksadresse', () => {
        it('Setter ny mottaksadresse', async () => {
          const form: Form = formMedProps({ mottaksadresseId: undefined });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText('Mottaksadresse'), '1');

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as Form;
          expect(updatedForm.properties.mottaksadresseId).toBe('1');
        });

        it('Fjerner valgt mottaksadresse', async () => {
          const form: Form = formMedProps({ mottaksadresseId: '1' });
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText('Mottaksadresse'), '');

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as Form;
          expect(updatedForm.properties.mottaksadresseId).toBeUndefined();
        });
      });
    });

    describe('Innstilling for valg av enhet ved papirsubmissionTypes', () => {
      const expectedCheckboxName = 'Bruker må velge enhet ved innsending på papir';
      const editFormMetadataEditor = (form: Form, onChange: UpdateFormFunction) => (
        <AppConfigProvider featureToggles={featureToggles}>
          <FormMetadataEditor form={form} onChange={onChange} />
        </AppConfigProvider>
      );

      it('Vises når submissionTypes=PAPER', async () => {
        const form: Form = formMedProps({
          submissionTypes: ['PAPER'],
          mottaksadresseId: undefined,
        });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeTruthy();
      });

      it('Vises når submissionTypes=PAPIR_OG_DIGITAL', async () => {
        const form: Form = formMedProps({ submissionTypes: ['PAPER', 'DIGITAL'] });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeTruthy();
      });

      it('Vises ikke når submissionTypes=INGEN', async () => {
        const form: Form = formMedProps({ submissionTypes: [] });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeFalsy();
      });

      it('Vises ikke når submissionTypes=KUN_DIGITAL', async () => {
        const form: Form = formMedProps({ submissionTypes: ['DIGITAL'] });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeFalsy();
      });

      it('Kan endres til true ved klikk på checkbox', async () => {
        const form: Form = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: false });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole('checkbox', {
          name: expectedCheckboxName,
        });
        expect(checkbox).not.toBeChecked();
        await userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(true);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole('checkbox', {
          name: expectedCheckboxName,
        });
        expect(checkbox).toBeChecked();
      });

      it('Kan endres til false ved klikk på checkbox', async () => {
        const form: Form = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        let checkbox = screen.getByRole('checkbox', {
          name: expectedCheckboxName,
        });
        expect(checkbox).toBeChecked();
        await userEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        checkbox = screen.getByRole('checkbox', {
          name: expectedCheckboxName,
        });
        expect(checkbox).not.toBeChecked();
      });

      it('huker av checkboxer for valgte enhetstyper', () => {
        const form: Form = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ['ALS', 'KO', 'LOKAL'],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        const checkboxes = screen.getAllByRole('checkbox', { checked: true });
        expect(checkboxes).toHaveLength(6);
      });

      it('fjerner valgt enhet ved klikk', async () => {
        const form: Form = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ['ALS', 'KO', 'LOKAL'],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.click(screen.getByRole('checkbox', { name: 'LOKAL' }));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.enhetstyper).toEqual(['ALS', 'KO']);
      });

      it('legger til ny valgt enhet ved klikk', async () => {
        const form: Form = formMedProps({
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: ['ALS', 'KO', 'LOKAL'],
        });
        render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.click(screen.getByRole('checkbox', { name: 'ARK' }));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.enhetstyper).toEqual(['ALS', 'KO', 'LOKAL', 'ARK']);
      });

      it('oppdaterer skjemaet med alle støttede enheter hvis enhetstyper er undefined', () => {
        const props = {
          mottaksadresseId: undefined,
          enhetMaVelgesVedPapirInnsending: true,
          enhetstyper: undefined,
        };
        const form: Form = formMedProps(props);
        render(editFormMetadataEditor(form, mockOnChange));
        expect(mockOnChange).toHaveBeenCalledTimes(1);
        expect(mockOnChange).toHaveBeenCalledWith(formMedProps({ ...props, enhetstyper: supportedEnhetstyper }));
      });

      it('Nullstilles og skjules når mottaksadresse velges', async () => {
        const form: Form = formMedProps({ mottaksadresseId: undefined, enhetMaVelgesVedPapirInnsending: true });
        const { rerender } = render(editFormMetadataEditor(form, mockOnChange));
        await userEvent.selectOptions(screen.getByLabelText('Mottaksadresse'), '1');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.mottaksadresseId).toBe('1');
        expect(updatedForm.properties.enhetMaVelgesVedPapirInnsending).toBe(false);

        rerender(editFormMetadataEditor(updatedForm, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeFalsy();
      });

      it('Er skjult når mottaksadresse er valgt', () => {
        const form: Form = formMedProps({ mottaksadresseId: '1', enhetMaVelgesVedPapirInnsending: true });
        render(editFormMetadataEditor(form, mockOnChange));
        expect(screen.queryByRole('checkbox', { name: expectedCheckboxName })).toBeFalsy();
      });
    });

    describe('Signaturer', () => {
      let form: Form;

      beforeEach(() => {
        form = formMedProps({});
      });

      it('Legger til signatur', async () => {
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.getAllByTestId('signatures');
        expect(signaturFieldsets).toHaveLength(1);

        const input = within(signaturFieldsets[0]).getByLabelText('Hvem skal signere?');
        await userEvent.click(input);
        await userEvent.paste('Lege');

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;

        expect(updatedForm.properties.signatures?.[0].label).toBe('Lege');
      });

      it("legger til ny signatur ved klikk på 'legg til signatur' knapp", async () => {
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const knapp = screen.getByRole('button', { name: 'Legg til signatur' });
        await userEvent.click(knapp);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.signatures?.[0].label).toBe('');
        expect(updatedForm.properties.signatures?.[0].description).toBe('');
      });

      it('Slett en signatur', async () => {
        const multipleSignatures = [
          {
            label: 'Doctor',
            description: 'Doctor Description',
            key: '0',
          },
          {
            label: 'Test',
            description: 'Test Description',
            key: '1',
          },
          {
            label: 'Applicant',
            description: 'Applicant Description',
            key: '2',
          },
        ];

        form = formMedProps({ signatures: multipleSignatures });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signaturFieldsets = screen.getAllByTestId('signatures');
        expect(signaturFieldsets).toHaveLength(3);
        const lukkKnapp = screen.getByRole('button', { name: 'Slett signatur 2' });
        await userEvent.click(lukkKnapp);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;

        expect(updatedForm.properties.signatures?.[0].label).toBe('Doctor');
        expect(updatedForm.properties.signatures?.[0].description).toBe('Doctor Description');
        expect(updatedForm.properties.signatures?.[1].label).toBe('Applicant');
        expect(updatedForm.properties.signatures?.[1].description).toBe('Applicant Description');
      });

      it('Legger til beskrivelse for en signatur', async () => {
        form = formMedProps({ signatures: [{ label: 'Lege', key: '0000' }] });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const signature1Description = screen.getAllByRole('textbox', { name: 'Instruksjoner til den som signerer' })[0];
        await userEvent.click(signature1Description);
        await userEvent.paste('Jeg bekrefter at personen er syk');

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.signatures?.[0].description).toBe('Jeg bekrefter at personen er syk');
        expect(updatedForm.properties.signatures?.[0].label).toBe('Lege');
      });
    });

    describe('Beskrivelse av alle signaturene', () => {
      it('settes i properties når tekst legges inn i tekstfelt', async () => {
        const form: Form = formMedProps({ signatures: [{ label: 'Lege', key: uuidv4() }] });
        render(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const input = screen.getByLabelText('Generelle instruksjoner (valgfritt)');
        await userEvent.click(input);
        await userEvent.paste('Lang beskrivelse av hvorfor man signerer');

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.descriptionOfSignatures).toBe('Lang beskrivelse av hvorfor man signerer');
      });
    });

    describe('UX signals', () => {
      const LABEL_ID = /UX signals id/i;
      const LABEL_INNSENDING = /UX signals skal vises for:/i;

      describe('Form without ux signals properties', () => {
        let rerender: (ui: React.ReactNode) => void;

        beforeEach(() => {
          const uxProps: Partial<FormPropertiesType> = {
            uxSignalsId: undefined,
            uxSignalsInnsending: undefined,
          };
          const form = formMedProps(uxProps);
          ({ rerender } = render(<FormMetadataEditor form={form} onChange={mockOnChange} />));
        });

        it('sets submissionTypesstype to its default value when id is provided', async () => {
          const input = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.click(input);
          await userEvent.paste('abcd-1234');
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({
                uxSignalsId: 'abcd-1234',
                uxSignalsInnsending: 'PAPIR_OG_DIGITAL',
              }),
            }),
          );
        });

        it('ignores changes to id with spaces', async () => {
          const input = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.click(input);
          await userEvent.paste(' ');
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({ uxSignalsId: undefined, uxSignalsInnsending: undefined }),
            }),
          );
        });

        it('does not display submissionTypes combobox before id is provided', async () => {
          expect(screen.queryByRole('combobox', { name: LABEL_INNSENDING })).not.toBeInTheDocument();

          const input = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.click(input);
          await userEvent.paste('u');

          expect(mockOnChange).toHaveBeenCalled();
          const calls = mockOnChange.mock.calls;
          const updatedForm = calls[calls.length - 1][0];

          rerender(<FormMetadataEditor form={updatedForm} onChange={mockOnChange} />);

          const combobox = screen.queryByRole('combobox', { name: LABEL_INNSENDING });
          expect(combobox).toBeInTheDocument();
          expect(combobox).toHaveValue('PAPIR_OG_DIGITAL');
        });
      });

      describe('Form with both id and submissionTypes in properties', () => {
        beforeEach(() => {
          const uxProps: Partial<FormPropertiesType> = {
            uxSignalsId: '123',
            uxSignalsInnsending: 'PAPIR_OG_DIGITAL',
          };
          const form = formMedProps(uxProps);
          render(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        });

        it('renders correct values', async () => {
          const idInput = screen.getByRole('textbox', { name: LABEL_ID });
          expect(idInput).toHaveValue('123');
          expect(screen.getByRole('combobox', { name: LABEL_INNSENDING })).toHaveValue('PAPIR_OG_DIGITAL');
        });

        it('also clears submissionTypesstype when id is cleared', async () => {
          const idInput = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.clear(idInput);
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({ uxSignalsId: undefined, uxSignalsInnsending: undefined }),
            }),
          );
        });

        it('selects another innsendingstype', async () => {
          const combobox = screen.getByRole('combobox', { name: LABEL_INNSENDING });
          await userEvent.selectOptions(combobox, 'KUN_PAPIR');
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({ uxSignalsId: '123', uxSignalsInnsending: 'KUN_PAPIR' }),
            }),
          );
        });

        it('only includes valid innsendingstype for UX signals', () => {
          const combobox = screen.getByRole('combobox', { name: LABEL_INNSENDING });
          const allOptions: HTMLOptionElement[] = within(combobox).getAllByRole('option');
          expect(allOptions).toHaveLength(3);
          allOptions.forEach((option) => {
            expect(option.value).toMatch(/KUN_PAPIR|PAPIR_OG_DIGITAL|KUN_DIGITAL/);
          });
        });
      });
    });
  });

  describe('Usage context: CREATE', () => {
    describe('Tema', () => {
      it('lister ut temaer', () => {
        render(<CreationFormMetadataEditor form={defaultForm} onChange={mockOnChange} />);
        const temaSelect = screen.getByRole('combobox', { name: 'Tema' });
        const options = within(temaSelect).queryAllByRole('option');
        expect(options).toHaveLength(4);
        expect(options[1]).toHaveTextContent('Tema 1 (ABC)');
        expect(options[2]).toHaveTextContent('Tema 3 (XYZ)');
        expect(options[3]).toHaveTextContent('Tema 2 (DEF)');
      });

      it('setter valgt tema hvis temakoden finnes blant valgene', () => {
        const form = formMedProps({ tema: 'DEF' });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('DEF');
      });

      it('setter valg til default verdi hvis temakoden ikke eksisterer', () => {
        const form = formMedProps({ tema: 'JKL' });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('');
      });

      it('oppdaterer skjema når bruker velger et nytt tema', async () => {
        const form: Form = formMedProps({ tema: 'ABC' });
        render(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'XYZ');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.tema).toBe('XYZ');
      });
    });
  });
});
