import { AppConfigProvider, http } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import mockRecipients from '../../fakeBackend/mock-recipients';
import { CreationFormMetadataEditor, FormMetadataEditor } from './FormMetadataEditor';

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

vi.mock('react-router', async () => {
  const actual = await vi.importActual<object>('react-router');
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
    subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
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
  let mockHttp;

  const renderWithProvider = (ui) =>
    render(<AppConfigProvider http={mockHttp as unknown as typeof http}>{ui}</AppConfigProvider>);

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockHttp = { get: vi.fn() };
    mockHttp.get.mockReturnValue(Promise.resolve([{ kodenavn: 'TILTAK', term: 'Tiltak' }]));
  });

  describe('Usage context: EDIT', () => {
    describe('Forklaring til innsending', () => {
      it('Viser input for forklaring når submissionTypes settes til []', async () => {
        const form: Form = {
          ...defaultForm,
          properties: {
            ...defaultForm.properties,
            submissionTypes: ['DIGITAL'],
          },
        };
        const { rerender } = renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

        const digitalCheckboxes = screen.getAllByRole('checkbox', { name: /Digital/i });
        const digitalInnsending = digitalCheckboxes[0];

        await userEvent.click(digitalInnsending);

        expect(mockOnChange).toHaveBeenCalled();
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        await waitFor(() => {
          expect(updatedForm.properties.submissionTypes).toStrictEqual([]);
        });

        rerender(
          <AppConfigProvider http={mockHttp as unknown as typeof http}>
            <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
          </AppConfigProvider>,
        );
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
        const { rerender } = renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.queryByLabelText('Forklaring til innsending')).not.toBeNull();

        const papirCheckboxes = screen.getAllByRole('checkbox', { name: /Papir/i });
        const papirInnsending = papirCheckboxes[0];

        await userEvent.click(papirInnsending);

        await expect(mockOnChange).toHaveBeenCalled();

        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.submissionTypes).toStrictEqual(['PAPER']);

        rerender(
          <AppConfigProvider http={mockHttp as unknown as typeof http}>
            <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
          </AppConfigProvider>,
        );
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
      const { rerender } = renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
      expect(screen.queryByLabelText('Forklaring til innsending')).not.toBeNull();
      const papirCheckboxes = screen.getAllByRole('checkbox', { name: /Papir/i });
      const papirInnsending = papirCheckboxes[0];

      await userEvent.click(papirInnsending);

      expect(mockOnChange).toHaveBeenCalled();
      const updatedForm = mockOnChange.mock.calls[0][0] as Form;
      expect(updatedForm.properties.submissionTypes).toStrictEqual(['PAPER']);

      rerender(
        <AppConfigProvider http={mockHttp as unknown as typeof http}>
          <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
        </AppConfigProvider>,
      );
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
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Tekst på knapp for nedlasting av pdf');
        await userEvent.click(input);
        await userEvent.paste('Last ned pdf');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.downloadPdfButtonText).toBe('Last ned pdf');
      });

      it('nullstilles i properties', async () => {
        const form = formMedDownloadPdfButtonText('Last meg ned');
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Tekst på knapp for nedlasting av pdf');
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.downloadPdfButtonText).toBe('');
      });
    });

    describe('Ettersendelsesfrist', () => {
      it('lagres i properties', async () => {
        const form = formMedProps({ ettersendelsesfrist: undefined, subsequentSubmissionTypes: ['DIGITAL'] });

        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Ettersendelsesfrist (dager)');
        await userEvent.click(input);
        await userEvent.paste('42');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.ettersendelsesfrist).toBe('42');
      });

      it('nullstilles i properties', async () => {
        const form = formMedProps({ ettersendelsesfrist: '42', subsequentSubmissionTypes: ['DIGITAL'] });
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        const input = screen.getByLabelText('Ettersendelsesfrist (dager)');
        await userEvent.clear(input);

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.ettersendelsesfrist).toBe('');
      });
    });

    describe('mellomlagringDurationDays', () => {
      it('is saved in properties', async () => {
        const form = formMedProps({ mellomlagringDurationDays: undefined, subsequentSubmissionTypes: ['DIGITAL'] });

        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
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
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeFalsy();
        });

        it('Vises ikke når submissionTypes=KUN_DIGITAL', async () => {
          const form: Form = formMedProps({ submissionTypes: ['DIGITAL'] });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeFalsy();
        });

        it('Vises når submissionTypes=[PAPER]', async () => {
          const form: Form = formMedProps({ submissionTypes: ['PAPER'] });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeTruthy();
        });

        it('Vises når submissionTypes=[PAPER, DIGITAL]', async () => {
          const form: Form = formMedProps({ submissionTypes: ['PAPER', 'DIGITAL'] });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.queryByLabelText('Mottaksadresse')).toBeTruthy();
        });

        it('Viser valgt mottaksadresse med formattering', async () => {
          const form: Form = formMedProps({ mottaksadresseId: '1' });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          expect(screen.getByDisplayValue('Nav alternativ skanning, Postboks 3, 0591 Oslo')).toBeTruthy();
        });
      });

      describe('Endring av mottaksadresse', () => {
        it('Setter ny mottaksadresse', async () => {
          const form: Form = formMedProps({ mottaksadresseId: undefined });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText('Mottaksadresse'), '1');

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as Form;
          expect(updatedForm.properties.mottaksadresseId).toBe('1');
        });

        it('Fjerner valgt mottaksadresse', async () => {
          const form: Form = formMedProps({ mottaksadresseId: '1' });
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
          await userEvent.selectOptions(screen.getByLabelText('Mottaksadresse'), '');

          expect(mockOnChange).toHaveBeenCalledTimes(1);
          const updatedForm = mockOnChange.mock.calls[0][0] as Form;
          expect(updatedForm.properties.mottaksadresseId).toBeUndefined();
        });
      });
    });

    describe('Signaturer', () => {
      let form: Form;

      beforeEach(() => {
        form = formMedProps({});
      });

      it('Legger til signatur', async () => {
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

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
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

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
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

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
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

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
        renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);

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
            uxSignalsSubmissionTypes: undefined,
          };
          const form = formMedProps(uxProps);
          ({ rerender } = renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />));
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
                uxSignalsSubmissionTypes: ['PAPER', 'DIGITAL'],
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
              properties: expect.objectContaining({ uxSignalsId: undefined, uxSignalsSubmissionTypes: undefined }),
            }),
          );
        });

        it('does not display submissionTypes checkboxes before id is provided', async () => {
          expect(screen.queryByRole('group', { name: LABEL_INNSENDING })).not.toBeInTheDocument();

          const input = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.click(input);
          await userEvent.paste('u');

          expect(mockOnChange).toHaveBeenCalled();
          const calls = mockOnChange.mock.calls;
          const updatedForm = calls[calls.length - 1][0];

          rerender(
            <AppConfigProvider http={mockHttp as unknown as typeof http}>
              <FormMetadataEditor form={updatedForm} onChange={mockOnChange} />
            </AppConfigProvider>,
          );

          const checkboxGroup = screen.queryByRole('group', { name: LABEL_INNSENDING });
          expect(checkboxGroup).toBeInTheDocument();
          expect(within(checkboxGroup!).getByRole('checkbox', { name: 'Papir' })).toBeChecked();
          expect(within(checkboxGroup!).getByRole('checkbox', { name: 'Digital' })).toBeChecked();
        });
      });

      describe('Form with both id and ux signals submissionTypes in properties', () => {
        beforeEach(() => {
          const uxProps: Partial<FormPropertiesType> = {
            submissionTypes: ['DIGITAL', 'PAPER'],
            uxSignalsId: '123',
            uxSignalsSubmissionTypes: ['PAPER', 'DIGITAL'],
          };
          const form = formMedProps(uxProps);
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        });

        it('renders correct checkboxes', async () => {
          const idInput = screen.getByRole('textbox', { name: LABEL_ID });
          expect(idInput).toHaveValue('123');
          expect(screen.getByRole('group', { name: LABEL_INNSENDING })).toBeVisible();
          const checkBoxes = within(screen.getByRole('group', { name: LABEL_INNSENDING })).getAllByRole('checkbox');
          expect(checkBoxes).toHaveLength(2);
          expect(checkBoxes[0]).toBeChecked();
          expect(checkBoxes[1]).toBeChecked();
        });

        it('also clears submissionTypes when id is cleared', async () => {
          const idInput = screen.getByRole('textbox', { name: LABEL_ID });
          await userEvent.clear(idInput);
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({ uxSignalsId: undefined, uxSignalsSubmissionTypes: undefined }),
            }),
          );
        });

        it('selects another innsendingstype', async () => {
          const checkboxGroup = screen.getByRole('group', { name: LABEL_INNSENDING });
          expect(checkboxGroup).toBeVisible();
          await userEvent.click(within(checkboxGroup).getByRole('checkbox', { name: 'Digital' }));
          expect(mockOnChange).toHaveBeenCalled();
          expect(mockOnChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              properties: expect.objectContaining({ uxSignalsId: '123', uxSignalsSubmissionTypes: ['PAPER'] }),
            }),
          );
        });
      });

      describe('Form that only supports paper submission', () => {
        beforeEach(() => {
          const uxProps: Partial<FormPropertiesType> = {
            submissionTypes: ['PAPER'],
            uxSignalsId: '123',
            uxSignalsSubmissionTypes: [],
          };
          const form = formMedProps(uxProps);
          renderWithProvider(<FormMetadataEditor form={form} onChange={mockOnChange} />);
        });

        it('does not display ux signals submissionTypes checkboxes', () => {
          const idInput = screen.getByRole('textbox', { name: LABEL_ID });
          expect(idInput).toHaveValue('123');
          expect(screen.queryByRole('group', { name: LABEL_INNSENDING })).toBeNull();
        });
      });
    });
  });

  describe('Usage context: CREATE', () => {
    describe('Tema', () => {
      it('lister ut temaer', () => {
        renderWithProvider(<CreationFormMetadataEditor form={defaultForm} onChange={mockOnChange} />);
        const temaSelect = screen.getByRole('combobox', { name: 'Tema' });
        const options = within(temaSelect).queryAllByRole('option');
        expect(options).toHaveLength(4);
        expect(options[1]).toHaveTextContent('Tema 1 (ABC)');
        expect(options[2]).toHaveTextContent('Tema 3 (XYZ)');
        expect(options[3]).toHaveTextContent('Tema 2 (DEF)');
      });

      it('setter valgt tema hvis temakoden finnes blant valgene', () => {
        const form = formMedProps({ tema: 'DEF' });
        renderWithProvider(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('DEF');
      });

      it('setter valg til default verdi hvis temakoden ikke eksisterer', () => {
        const form = formMedProps({ tema: 'JKL' });
        renderWithProvider(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        expect(screen.getByRole('combobox', { name: 'Tema' })).toHaveValue('');
      });

      it('oppdaterer skjema når bruker velger et nytt tema', async () => {
        const form: Form = formMedProps({ tema: 'ABC' });
        renderWithProvider(<CreationFormMetadataEditor form={form} onChange={mockOnChange} />);
        await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'XYZ');

        expect(mockOnChange).toHaveBeenCalledTimes(1);
        const updatedForm = mockOnChange.mock.calls[0][0] as Form;
        expect(updatedForm.properties.tema).toBe('XYZ');
      });
    });
  });
});
