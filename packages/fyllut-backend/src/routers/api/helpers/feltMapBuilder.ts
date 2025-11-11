import {
  dateUtils,
  DeclarationType,
  FormPropertiesType,
  formSummaryUtil,
  I18nTranslationReplacements,
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
  Tkey,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { EkstraBunntekst, FeltMap, PdfConfig, VerdilisteElement } from '../../../types/familiepdf/feltMapTypes';

type TranslateFunction = (text: string) => string;

const { gitVersion, isDelingslenke } = config;

/**
 * @deprecated This should be deleted and replaced with sending json from frontend instead
 */
export const createFeltMapFromSubmission = (
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  lang: string = 'nb',
) => {
  const identityNumber = yourInformationUtils.getIdentityNumber(form, submission) ?? '—';

  const symmaryPanels: SummaryPanel[] = formSummaryUtil.createFormSummaryPanels(
    form,
    submission,
    translate,
    true,
    lang,
    { skipPdfFormatting: true },
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

  const ekstraBunntekst: EkstraBunntekst = {
    upperleft: translate(TEXTS.statiske.footer.userIdLabel) + `: ${identityNumber}`,
    lowerleft: translate(TEXTS.statiske.footer.schemaNumberLabel) + `: ${form.properties.skjemanummer}`,
    upperRight: null,
    upperMiddle:
      translate(TEXTS.statiske.footer.createdDatelabel) + `: ${dateUtils.toCurrentDayMonthYearHourMinute(lang)}`,
    lowerMiddle: translate(TEXTS.statiske.footer.versionLabel) + `: ${gitVersion}`,
  };

  const sprak: string = lang === 'nn-NO' || lang == 'nn' ? 'nn' : lang === 'en' ? 'en' : 'nb';

  const pdfConfig: PdfConfig = { harInnholdsfortegnelse: false, språk: sprak };
  const feltMap: FeltMap = {
    label: title,
    pdfConfig: pdfConfig,
    skjemanummer: form.properties.skjemanummer,
    verdiliste,
    bunntekst: ekstraBunntekst,
    vannmerke: isDelingslenke ? 'Testskjema - Ikke send til Nav' : null,
  };

  logger.info('FeltMap created for form: ' + feltMap.label + ', vannmerke =' + feltMap.vannmerke);

  return JSON.stringify(feltMap).replaceAll('\\t', '  ');
};

const createConfirmationElement = (
  form: NavFormType,
  translate: (text: string) => string,
): VerdilisteElement | undefined => {
  const generateConfirmationField = (text: string): VerdilisteElement => {
    return {
      label: translate(TEXTS.statiske.declaration.header),
      verdiliste: [
        {
          label: translate(text),
          verdi: translate(TEXTS.common.yes),
        },
      ],
    };
  };
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
    verdiliste: component.components.map((comp): VerdilisteElement | null => {
      return createVerdilisteElement(comp);
    }),
    visningsVariant: null,
  };
};

const tableMap = (component): VerdilisteElement => {
  return {
    label: component.label ? component.label : '',
    verdiliste: component.components.map((comp: SummaryDataGridRow, index: number): VerdilisteElement | null => {
      return datagridRowMap(comp, index + 1);
    }),
    //visningsVariant: 'TABELL', Fjernet da vi ikke ønsker pysjamas striper i PDF
    visningsVariant: null,
  };
};

const datagridRowMap = (component, index): VerdilisteElement => {
  if (component.components) {
    return {
      label: component.label ? component.label : '' + index,
      verdiliste: component.components.map((comp): VerdilisteElement => {
        return createVerdilisteElement(comp);
      }),
      visningsVariant: null,
    };
  } else {
    return createVerdilisteElement(component);
  }
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
  return {
    label: component.value.toString(),
    verdi: null,
    verdiliste: null,
    visningsVariant: 'HTML',
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
    verdi: component.value.description,
    verdiliste: component.value.dates.map((date) => {
      return drivingListDay(date.key, date.text);
    }),
    visningsVariant: 'PUNKTLISTE',
  };
};

const drivingListDay = (label: string, value: string): VerdilisteElement => {
  return {
    label: value,
    verdi: null,
    verdiliste: null,
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
  //logger.info('fieldMap =' + component.label);
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
      // Default signature der en person skal signere med sted og dato, signature og med blokkbokstaver.
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
    { label: translatedDescription, verdi: ' ' },
    { label: translatedPlaceDate, verdi: ' ' },
    { label: translatedSignature, verdi: ' ' },
    { label: translatedBlockSignature, verdi: ' ' },
  ];

  return { label: translatedLabel, verdiliste: verdiListe };
};
