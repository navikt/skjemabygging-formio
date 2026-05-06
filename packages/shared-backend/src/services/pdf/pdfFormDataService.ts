import {
  dateUtils,
  DeclarationType,
  FormPropertiesType,
  formSummaryUtils,
  I18nTranslationReplacements,
  NavFormType,
  PdfData,
  PdfFooter,
  PdfFormData,
  signatureUtils,
  Submission,
  SummaryActivity,
  SummaryAddress,
  SummaryAttachment,
  SummaryComponent,
  SummaryDataFetcher,
  SummaryDataGridRow,
  SummaryField,
  SummaryPanel,
  SummarySelectboxes,
  TEXTS,
  Tkey,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

type PdfTranslateFunction = (text: string, textReplacements?: I18nTranslationReplacements) => string;

interface CreatePdfFormDataFromSubmissionProps {
  form: NavFormType;
  submission: Submission;
  submissionMethod: string;
  translate: PdfTranslateFunction;
  language?: string;
  gitVersion?: string;
  isDelingslenke?: boolean;
}

const normalizePdfString = (value?: string) => (typeof value === 'string' ? value.replaceAll('\t', '  ') : value);

const normalizeNullablePdfString = (value: string | null) =>
  typeof value === 'string' ? value.replaceAll('\t', '  ') : value;

const normalizePdfData = (data: PdfData): PdfData => ({
  ...data,
  label: normalizePdfString(data.label),
  verdi: typeof data.verdi === 'string' ? normalizePdfString(data.verdi) : data.verdi,
  verdiliste: data.verdiliste?.map(normalizePdfData),
});

const normalizePdfDataList = (list: PdfData[]) => list.map(normalizePdfData);

const normalizePdfFooter = (footer: PdfFooter): PdfFooter => ({
  upperleft: normalizeNullablePdfString(footer.upperleft),
  lowerleft: normalizeNullablePdfString(footer.lowerleft),
  upperMiddle: normalizeNullablePdfString(footer.upperMiddle),
  lowerMiddle: normalizeNullablePdfString(footer.lowerMiddle),
  upperRight: normalizeNullablePdfString(footer.upperRight),
});

const mapPdfLanguage = (language: string = 'nb') => {
  if (language === 'nn-NO' || language === 'nn') {
    return 'nn';
  }
  if (language === 'en') {
    return 'en';
  }
  return 'nb';
};

const sectionMap = (component): PdfData => ({
  label: component.label || '',
  verdi: null,
  verdiliste: component.components.map((comp): PdfData => createPdfData(comp)),
  visningsVariant: null,
});

const subSectionMap = (component): PdfData => ({
  label: component.label || '',
  verdiliste: component.components.map((comp): PdfData => createPdfData(comp)),
  visningsVariant: null,
});

const datagridRowMap = (component, index): PdfData => {
  if (component.components) {
    return {
      label: component.label || `${index}`,
      verdiliste: component.components.map((comp): PdfData => createPdfData(comp)),
      visningsVariant: null,
    };
  }

  return createPdfData(component);
};

const tableMap = (component): PdfData => ({
  label: component.label || '',
  verdiliste: component.components.map(
    (comp: SummaryDataGridRow, index: number): PdfData => datagridRowMap(comp, index + 1),
  ),
  visningsVariant: null,
});

const multipleAnswersMap = (component: SummarySelectboxes | SummaryDataFetcher): PdfData => ({
  label: component.label,
  verdi: null,
  verdiliste: component.value.map((text) => ({ label: text })),
  visningsVariant: 'PUNKTLISTE',
});

const htmlMap = (component: SummaryField): PdfData => ({
  label: component.value.toString(),
  verdi: null,
  visningsVariant: 'HTML',
});

const activityMap = (component: SummaryActivity): PdfData => ({
  label: component.label,
  verdi: component.value.text,
  visningsVariant: null,
});

const drivingListMap = (component): PdfData => ({
  label: component.label,
  verdi: component.value.description,
  verdiliste: component.value.dates.map((date) => ({
    label: date.text,
    verdi: null,
    verdiliste: null,
    visningsVariant: null,
  })),
  visningsVariant: 'PUNKTLISTE',
});

const addressMap = (component: SummaryAddress): PdfData => ({
  label: component.label,
  verdi: `${component.value}`,
  visningsVariant: null,
});

const fieldMap = (component: SummaryField): PdfData => ({
  label: component.label,
  verdi: `${component.value}`,
  visningsVariant: null,
});

const attachmentMap = (component: SummaryAttachment): PdfData => ({
  label: component.label,
  verdi: component.value.description,
  visningsVariant: null,
});

const createPdfData = (component: SummaryComponent): PdfData => {
  if (component.hiddenInSummary) {
    return { label: '' };
  }

  switch (component.type) {
    case 'fieldset':
      return sectionMap(component);
    case 'panel':
    case 'navSkjemagruppe':
      return subSectionMap(component);
    case 'datagrid':
      return tableMap(component);
    case 'datagrid-row':
      return datagridRowMap(component, 0);
    case 'dataFetcher':
    case 'selectboxes':
      return multipleAnswersMap(component);
    case 'alertstripe':
    case 'htmlelement':
      return htmlMap(component);
    case 'activities':
      return activityMap(component);
    case 'drivinglist':
      return drivingListMap(component);
    case 'navAddress':
      return addressMap(component);
    case 'attachment':
      return attachmentMap(component as SummaryAttachment);
    default:
      return fieldMap(component);
  }
};

const createPdfDataList = (summaryPanels: SummaryPanel[]): PdfData[] =>
  normalizePdfDataList(summaryPanels.map(createPdfData));

const createConfirmationElement = (form: NavFormType, translate: PdfTranslateFunction): PdfData | undefined => {
  const generateConfirmationField = (text: string): PdfData => ({
    label: translate(TEXTS.statiske.declaration.header),
    verdiliste: [
      {
        label: translate(text),
        verdi: translate(TEXTS.common.yes),
      },
    ],
  });

  if (form?.introPage?.enabled && form?.introPage?.selfDeclaration) {
    const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';
    return generateConfirmationField(inputLabel);
  }

  if (form.properties.declarationType === DeclarationType.custom && form.properties.declarationText) {
    return generateConfirmationField(form.properties.declarationText);
  }

  if (form.properties.declarationType === DeclarationType.default) {
    return generateConfirmationField(TEXTS.statiske.declaration.defaultText);
  }
};

const signatureSection = (
  formProperties: FormPropertiesType,
  submissionMethod: string,
  translate: PdfTranslateFunction,
): PdfData | null => {
  if (submissionMethod === 'digital') {
    return null;
  }

  const { signatures, descriptionOfSignatures } = formProperties;
  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);
  if (signatureList.length === 0) {
    return null;
  }

  const translatedDescriptionOfSignatures = translate(descriptionOfSignatures || '');
  const translatedPlaceDate = translate(TEXTS.statiske.pdf.placeAndDate);
  const translatedSignature = translate(TEXTS.statiske.pdf.signature);
  const translatedBlockSignature = translate(TEXTS.statiske.pdf.signatureName);

  const signatureData = signatureList.map((signatureObject) => ({
    label: translate(signatureObject.label),
    verdiliste: [
      { label: translate(signatureObject.description), verdi: ' ' },
      { label: translatedPlaceDate, verdi: ' ' },
      { label: translatedSignature, verdi: ' ' },
      { label: translatedBlockSignature, verdi: ' ' },
    ],
  }));

  if (signatureData.length === 1 && (signatureData[0].label === undefined || signatureData[0].label === '')) {
    return {
      label: translatedSignature,
      verdiliste: signatureData[0].verdiliste,
    };
  }

  return {
    label: translatedSignature,
    verdiliste: [{ label: translatedDescriptionOfSignatures, verdi: '' }, ...signatureData],
  };
};

const createPdfFormDataFromSubmission = (props: CreatePdfFormDataFromSubmissionProps): PdfFormData => {
  const {
    form,
    submission,
    submissionMethod,
    translate,
    language = 'nb',
    gitVersion = '',
    isDelingslenke = false,
  } = props;
  const identityNumber = yourInformationUtils.getIdentityNumber(form, submission) ?? '—';
  const summaryPanels = formSummaryUtils.createFormSummaryPanels(form, submission, translate, true, language, {
    skipPdfFormatting: true,
    submissionMethod,
  });

  const verdiliste = createPdfDataList(summaryPanels);
  const confirmation = createConfirmationElement(form, translate);
  const signatures = signatureSection(form.properties, submissionMethod, translate);
  if (confirmation) {
    verdiliste.push(normalizePdfData(confirmation));
  }
  if (signatures) {
    verdiliste.push(normalizePdfData(signatures));
  }

  return {
    label: normalizePdfString(translate(form.title)),
    pdfConfig: { harInnholdsfortegnelse: false, språk: mapPdfLanguage(language) },
    skjemanummer: form.properties?.skjemanummer,
    verdiliste,
    bunntekst: normalizePdfFooter({
      upperleft: `${translate(TEXTS.statiske.footer.userIdLabel)}: ${identityNumber}`,
      lowerleft: `${translate(TEXTS.statiske.footer.schemaNumberLabel)}: ${form.properties?.skjemanummer}`,
      upperMiddle: `${translate(TEXTS.statiske.footer.createdDatelabel)}: ${dateUtils.toCurrentDayMonthYearHourMinute(language)}`,
      lowerMiddle: `${translate(TEXTS.statiske.footer.versionLabel)}: ${gitVersion}`,
      upperRight: null,
    }),
    vannmerke: isDelingslenke ? 'Testskjema - Ikke send til Nav' : null,
  };
};

const pdfFormDataService = {
  createPdfDataList,
  createPdfFormDataFromSubmission,
};

export default pdfFormDataService;
