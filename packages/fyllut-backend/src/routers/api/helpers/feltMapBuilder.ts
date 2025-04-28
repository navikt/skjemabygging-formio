import {
  DeclarationType,
  FormPropertiesType,
  formSummaryUtil,
  NavFormType,
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
} from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../../logger';
import { FeltMap, PdfConfig, VerdilisteElement } from '../../../types/familiepdf/feltMapTypes';

type TranslateFunction = (text: string) => string;

export const createFeltMapFromSubmission = (
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string) => string,
  lang: string = 'nb',
) => {
  const symmaryPanels: SummaryPanel[] = formSummaryUtil.createFormSummaryPanels(
    form,
    submission,
    translate,
    true,
    lang,
  );
  const confirmation = createConfirmationElement(form, translate);
  const signatures = signatureSection(form.properties, submissionMethod, translate);
  const title = translate(form.title);

  const verdiliste: VerdilisteElement[] = createVerdilister(symmaryPanels);
  if (confirmation) {
    verdiliste.push(confirmation);
  }
  if (signatures) {
    verdiliste.push(signatures);
  }

  const pdfConfig: PdfConfig = { harInnholdsfortegnelse: false, språk: lang };
  const feltMap: FeltMap = {
    label: title,
    pdfConfig: pdfConfig,
    skjemanummer: form.properties.skjemanummer,
    verdiliste,
  };

  logger.info(`FeltMapString: ${JSON.stringify(feltMap)}`);
  return JSON.stringify(feltMap);
};

const createConfirmationElement = (
  form: NavFormType,
  translate: (text: string) => string,
): VerdilisteElement | undefined => {
  if (
    form.properties.declarationType === DeclarationType.custom ||
    form.properties.declarationType === DeclarationType.default
  ) {
    return {
      label: translate(TEXTS.statiske.declaration.header),
      verdiliste: [
        {
          label:
            form.properties.declarationType === DeclarationType.custom && form.properties.declarationText
              ? translate(form.properties.declarationText)
              : translate(TEXTS.statiske.declaration.defaultText),
          verdi: translate(TEXTS.common.yes),
        },
      ],
    };
  }
};

export const createVerdilister = (summaryPanels: SummaryPanel[]): VerdilisteElement[] => {
  return summaryPanels.map((summaryPanel) => {
    return createVerdilisteElement(summaryPanel);
  });
};

const createVerdilisteElement = (component: SummaryComponent): VerdilisteElement => {
  if (!component.hiddenInSummary) {
    switch (component.type) {
      case 'fieldset':
        return sectionMap(component);
      case 'panel':
      case 'navSkjemagruppe':
      case 'datagrid':
        return subSectionMap(component);
      case 'datagrid-row':
        return datagridRowMap(component);
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
  } else return { label: '' };
};

const sectionMap = (component): VerdilisteElement => {
  return {
    label: component.label ? component.label : '',
    verdi: null,
    verdiliste: component.components.map((comp): VerdilisteElement | null => {
      return createVerdilisteElement(comp);
    }),
    visningsVariant: null,
  };
};

const subSectionMap = (component): VerdilisteElement => {
  return {
    label: component.label ? component.label : '',
    verdi: null,
    verdiliste: component.components.map((comp): VerdilisteElement | null => {
      return createVerdilisteElement(comp);
    }),
    visningsVariant: null,
  };
};

const datagridRowMap = (component: SummaryDataGridRow): VerdilisteElement => {
  return {
    label: component.label ? component.label : '',
    verdi: null,
    verdiliste: component.components.map((comp): VerdilisteElement => {
      return createVerdilisteElement(comp);
    }),
    visningsVariant: 'TABELL',
  };
};

const multipleAnswersMap = (component: SummarySelectboxes | SummaryDataFetcher): VerdilisteElement => {
  return {
    label: component.label,
    verdi: null,
    verdiliste: component.value.map((txt) => {
      return { label: txt };
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

const htmlMap = (component: SummaryField): VerdilisteElement => {
  if (component.type) {
    return fieldMap(component);
  }
  return {
    label: '',
    verdi: `${component.value}`,
    verdiliste: null,
    visningsVariant: null,
  };
};

const activityMap = (component: SummaryActivity): VerdilisteElement => {
  return {
    label: component.label,
    verdi: component.value.text,
    verdiliste: null,
    visningsVariant: null,
  };
};

const drivingListMap = (component): VerdilisteElement => {
  return {
    label: component.label,
    verdi: `${component.value.description}`,
    verdiliste: component.dates.map((date) => {
      return { label: date.key, value: date.text };
    }),
    visningsVariant: null,
  };
};

const addressMap = (component: SummaryAddress): VerdilisteElement => {
  return {
    label: component.label,
    verdi: `${component.value}`,
    verdiliste: null,
    visningsVariant: null,
  };
};

const fieldMap = (component: SummaryField): VerdilisteElement => {
  return {
    label: component.label,
    verdi: `${component.value}`,
    verdiliste: null,
    visningsVariant: null,
  };
};

const attachmentMap = (component: SummaryAttachment): VerdilisteElement => {
  return {
    label: component.label,
    verdi: component.value.description,
    verdiliste: null,
    visningsVariant: null,
  };
};

const signatureSection = (
  formProperties: FormPropertiesType,
  submissionMethod: string,
  translate: TranslateFunction,
): VerdilisteElement | null => {
  if (submissionMethod === 'digital') {
    return null;
  }
  const { signatures, descriptionOfSignatures } = formProperties;
  const signatureList = signatureUtils.mapBackwardCompatibleSignatures(signatures);
  if (signatureList.length > 0) {
    const translatedDescriptionOfSignatures = translate(descriptionOfSignatures || '');
    const translatedPlaceDate = translate(TEXTS.pdfStatiske.placeAndDate);
    const translatedSignature = translate(TEXTS.pdfStatiske.signature);
    const translatedBlockSignature = translate(TEXTS.pdfStatiske.signatureName);

    const verdilisteMap = signatureList.map((signatureObject) => {
      return lagSubVerdilisteElement(
        translate(signatureObject.label),
        translate(signatureObject.description),
        translatedPlaceDate,
        translatedSignature,
        translatedBlockSignature,
      );
    });

    if (verdilisteMap.length === 1 && (verdilisteMap[0].label === undefined || verdilisteMap[0].label === '')) {
      return {
        label: translatedSignature,
        verdiliste: verdilisteMap[0].verdiliste,
      };
    }
    return {
      label: translatedSignature,
      verdiliste: [{ label: translatedDescriptionOfSignatures, verdi: '' }, ...verdilisteMap],
    };
  } else {
    return null;
  }
};

const lagSubVerdilisteElement = (
  translatedLabel: string,
  translatedDescription: string,
  translatedPlaceDate: string,
  translatedSignature: string,
  translatedBlockSignature: string,
): VerdilisteElement => {
  const verdiListe: VerdilisteElement[] = [
    { label: translatedDescription },
    { label: translatedPlaceDate, verdi: '___________________________________________________' },
    { label: translatedSignature, verdi: '___________________________________________________' },
    { label: translatedBlockSignature, verdi: '___________________________________________________' },
  ];

  return { label: translatedLabel, verdiliste: verdiListe };
};
