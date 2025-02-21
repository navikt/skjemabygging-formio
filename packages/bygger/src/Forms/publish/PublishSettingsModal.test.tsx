import { Form, FormPropertiesType, MockedComponentObjectForTest } from '@navikt/skjemadigitalisering-shared-domain';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublishSettingsModal, { getCompleteTranslationLanguageCodeList } from './PublishSettingsModal';

const { createDummyRadioPanel, createFormObject, createPanelObject } = MockedComponentObjectForTest;

vi.mock('../../context/translations/FormTranslationsContext', () => {
  const mockTranslations = [
    { key: 'Skjematittel', en: 'Form title', nn: 'Skjematittel' },
    { key: 'Bor du i Norge?', en: 'Do you live in Norway?' },
    { key: 'Veiledning', en: 'Guidance' },
    { key: 'NO-label', en: 'no' },
    { key: 'YES-label', en: 'yes', nn: 'yes' },
    { key: 'Dine opplysninger', en: 'Your information' },
    { key: 'Personinformasjon', en: 'Personal information' },
    { key: 'Hei verden', en: 'Hello world', nn: 'Hei verda' },
    { key: 'Hei panel', en: 'Hello panel', nn: 'Hei panel' },
  ];
  const mockUseI18nState = () => ({
    translations: mockTranslations,
  });
  return {
    useFormTranslations: mockUseI18nState,
  };
});

describe('PublishSettingsModal', () => {
  let mockedCloseModal;
  let mockedOnPublish;
  const renderPublishSettingsModal = (form) => {
    mockedCloseModal = vi.fn();
    mockedOnPublish = vi.fn();
    render(<PublishSettingsModal open={true} onClose={mockedCloseModal} onConfirm={mockedOnPublish} form={form} />);
  };

  it('renders disabled checkbox for Norsk bokmål', () => {
    const oldForm = createFormObject([createPanelObject('test', [createDummyRadioPanel('Bor du i Sverige?')])]);
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['nn'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    expect(screen.queryByRole('checkbox', { name: 'Norsk bokmål (NB)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Norsk bokmål (NB)' })).toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Norsk bokmål (NB)' })).toBeDisabled();
  });

  it('renders checked checkbox for language with complete translation', async () => {
    const oldForm = createFormObject(
      [createPanelObject('Dine opplysninger', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      // publishedLanguages: ['nn'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'draft',
    };
    renderPublishSettingsModal(form);
    expect(screen.queryByRole('checkbox', { name: 'Engelsk (EN)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Engelsk (EN)' })).toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).not.toBeInTheDocument();
  });

  it('renders disabled checkbox for previously published language when current translation is incomplete', async () => {
    const oldForm = createFormObject(
      [createPanelObject('Dine opplysninger', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['nn'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).toBeDisabled();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).not.toBeChecked();
  });

  it('displays a warning when checkbox for previously published translation is unchecked', async () => {
    const oldForm = createFormObject(
      [createPanelObject('Dine opplysninger', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['en'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    expect(
      screen.queryByText('OBS! Engelsk (EN) vil bli avpublisert hvis du publiserer med disse innstillingene.'),
    ).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Engelsk (EN)' }));
    expect(
      screen.queryByText('OBS! Engelsk (EN) vil bli avpublisert hvis du publiserer med disse innstillingene.'),
    ).toBeInTheDocument();
  });

  it('displays a warning when previously published translation currently is incomplete', () => {
    const oldForm = createFormObject(
      [createPanelObject('Dine opplysninger', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      publishedLanguages: ['nn'],
      status: 'published',
    };
    renderPublishSettingsModal(form);
    expect(
      screen.queryByText('OBS! Norsk nynorsk (NN) vil bli avpublisert hvis du publiserer med disse innstillingene.'),
    ).toBeInTheDocument();
  });

  it('publish will send en-languageCode if the English checkbox is checked, and "nb" (default)', async () => {
    const oldForm = createFormObject(
      [createPanelObject('Personinformasjon', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['en'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    const englishCheckbox = await screen.findByRole('checkbox', { name: 'Engelsk (EN)' });
    expect(englishCheckbox).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Publiser' }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual(['en', 'nb']);
  });

  it('publishes all checked languages', async () => {
    const oldForm = createFormObject([createPanelObject('Hei panel')], 'Hei verden');
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['nn', 'nb', 'en'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Engelsk (EN)' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Engelsk (EN)' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Publiser' }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual(['nn', 'en', 'nb']);
  });

  it('onPublish will send only "nb" (default) when the English checkbox is checked off', async () => {
    const oldForm = createFormObject(
      [createPanelObject('Personinformasjon', [createDummyRadioPanel('Bor du i Norge?')])],
      'Veiledning',
    );
    const form: Form = {
      path: 'nav123456',
      title: 'Skjematittel',
      skjemanummer: 'NAV 12-34.56',
      publishedLanguages: ['en'],
      components: oldForm.components,
      properties: {} as FormPropertiesType,
      status: 'published',
    };
    renderPublishSettingsModal(form);
    const englishCheckbox = await screen.findByRole('checkbox', { name: 'Engelsk (EN)' });
    expect(englishCheckbox).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Norsk nynorsk (NN)' })).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Engelsk (EN)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Publiser' }));
    expect(mockedOnPublish).toBeCalled();
    expect(mockedOnPublish.mock.calls[0][0]).toEqual(['nb']);
  });

  describe('getCompleteTranslationLanguageCodeList', () => {
    it('return empty list when there is no form text and translation', () => {
      const actual = getCompleteTranslationLanguageCodeList([], {});
      expect(actual).toEqual([]);
    });

    it('return empty list when there are form text and but no translation', () => {
      const actual = getCompleteTranslationLanguageCodeList(['Bor du i Norge', 'Ja', 'Nei'], {});
      expect(actual).toEqual([]);
    });

    it('return empty list when there are form text and not complete translations', () => {
      const actual = getCompleteTranslationLanguageCodeList(['Bor du i Norge?', 'Ja', 'Nei'], {
        en: { 'Bor du i Norge?': 'Do you live in Norway?' },
        'nn-NO': { Ja: 'Yes' },
      });
      expect(actual).toEqual([]);
    });

    it('return en when there are form text and complete English translations', () => {
      const actual = getCompleteTranslationLanguageCodeList(['Bor du i Norge?', 'Ja', 'Nei'], {
        en: { 'Bor du i Norge?': 'Do you live in Norway?', Ja: 'Yes', Nei: 'No' },
        'nn-NO': { Ja: 'Ja' },
      });
      expect(actual).toEqual(['en']);
    });

    it('return en and nn-NO when there are form text and complete English and Nynorsk translations', () => {
      const actual = getCompleteTranslationLanguageCodeList(['Bor du i Norge?', 'Ja', 'Nei'], {
        en: { 'Bor du i Norge?': 'Do you live in Norway?', Ja: 'Yes', Nei: 'No' },
        'nn-NO': { 'Bor du i Norge?': 'Bor du i Norge?', Ja: 'Ja', Nei: 'Nei', Takk: 'Takk' },
      });
      expect(actual).toEqual(['en', 'nn-NO']);
    });

    it('does not include nb-NO even if complete', () => {
      const actual = getCompleteTranslationLanguageCodeList(['Bor du i Norge?', 'Ja', 'Nei'], {
        en: { 'Bor du i Norge?': 'Do you live in Norway?', Ja: 'Yes', Nei: 'No' },
        'nn-NO': { 'Bor du i Norge?': 'Bur du i Noreg?', Ja: 'Ja', Nei: 'Nei', Takk: 'Takk' },
        'nb-NO': { 'Bor du i Norge?': 'Bor du i Norge?', Ja: 'Ja', Nei: 'Nei', Takk: 'Takk' },
      });
      expect(actual).toEqual(['en', 'nn-NO']);
    });
  });
});
