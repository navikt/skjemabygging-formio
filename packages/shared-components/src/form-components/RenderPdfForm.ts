import {
  Component,
  dateUtils,
  Form,
  Panel,
  Submission,
  SubmissionMethod,
  TEXTS,
  TranslateFunction,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../context/config/configContext';
import {
  PdfAccountNumber,
  PdfAddress,
  PdfAddressValidity,
  PdfAttachment,
  PdfCountrySelect,
  PdfCurrency,
  PdfCurrencySelect,
  PdfEmail,
  PdfFirstName,
  PdfIban,
  PdfIdentity,
  PdfNationalIdentityNumber,
  PdfOrganizationNumber,
  PdfPassword,
  PdfPhoneNumber,
  PdfSurname,
} from './components/customized';
import { PdfDatePicker, PdfMonthPicker, PdfYear } from './components/date';
import { PdfContainer, PdfDataGrid, PdfFormGroup, PdfPanel, PdfRow } from './components/group';
import { PdfIntroPage, PdfSignature } from './components/other';
import PdfAttachmentUpload from './components/other/attachment-uploads/PdfAttachmentUpload';
import {
  PdfAccordion,
  PdfAlert,
  PdfCheckbox,
  PdfHtmlElement,
  PdfImage,
  PdfNavSelect,
  PdfNumber,
  PdfRadio,
  PdfSelect,
  PdfSelectBoxes,
  PdfTextArea,
  PdfTextField,
} from './components/standard';
import { PdfActivities, PdfDataFetcher, PdfDrivingList, PdfMaalgruppe } from './components/system';
import renderPdfComponent from './render/RenderPdfComponent';
import { PdfFormData } from './types';

interface Props {
  activeComponents: Component[];
  activeAttachmentUploadsPanel?: Panel;
  submission?: Submission;
  form: Form;
  currentLanguage: string;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod | undefined;
  appConfig: AppConfigContextType;
}

const renderPdfForm = ({
  activeComponents,
  activeAttachmentUploadsPanel,
  submission,
  form,
  currentLanguage,
  translate,
  submissionMethod,
  appConfig,
}: Props): PdfFormData | undefined => {
  if (!submission || !form) {
    return;
  }

  const componentRegistry = {
    /* Standard */
    accordion: PdfAccordion,
    alertstripe: PdfAlert,
    navCheckbox: PdfCheckbox,
    htmlelement: PdfHtmlElement,
    image: PdfImage,
    number: PdfNumber,
    radiopanel: PdfRadio,
    select: PdfSelect,
    navSelect: PdfNavSelect,
    selectboxes: PdfSelectBoxes,
    textarea: PdfTextArea,
    formioTextArea: PdfTextArea,
    textfield: PdfTextField,

    /* Customized */
    bankAccount: PdfAccountNumber,
    navAddress: PdfAddress,
    addressValidity: PdfAddressValidity,
    attachment: PdfAttachment,
    landvelger: PdfCountrySelect,
    currency: PdfCurrency,
    valutavelger: PdfCurrencySelect,
    email: PdfEmail,
    firstName: PdfFirstName,
    iban: PdfIban,
    identity: PdfIdentity,
    fnrfield: PdfNationalIdentityNumber,
    orgNr: PdfOrganizationNumber,
    password: PdfPassword,
    phoneNumber: PdfPhoneNumber,
    surname: PdfSurname,

    /* Date */
    navDatepicker: PdfDatePicker,
    monthPicker: PdfMonthPicker,
    year: PdfYear,

    /* Group */
    container: PdfContainer,
    datagrid: PdfDataGrid,
    navSkjemagruppe: PdfFormGroup,
    fieldset: PdfFormGroup,
    panel: PdfPanel,
    row: PdfRow,

    /* System */
    activities: PdfActivities,
    dataFetcher: PdfDataFetcher,
    drivinglist: PdfDrivingList,
    maalgruppe: PdfMaalgruppe,
  };

  const attachmentUploadsComponentRegistry = {
    ...componentRegistry,
    attachment: PdfAttachmentUpload,
  };

  const languageCode: string =
    currentLanguage === 'nn-NO' || currentLanguage == 'nn' ? 'nn' : currentLanguage === 'en' ? 'en' : 'nb';

  return {
    label: translate(form.title),
    verdiliste: [
      PdfIntroPage({ submission, form, translate }),
      ...(activeComponents
        ?.map((component) =>
          renderPdfComponent({
            component,
            submissionPath: '',
            componentRegistry,
            submission,
            translate,
            currentLanguage,
          }),
        )
        .filter(Boolean) ?? []),
      ...(activeAttachmentUploadsPanel
        ? [
            renderPdfComponent({
              component: activeAttachmentUploadsPanel,
              submissionPath: '',
              componentRegistry: attachmentUploadsComponentRegistry,
              submission,
              translate,
              currentLanguage,
            }),
          ]
        : []),
      PdfSignature({ properties: form.properties, submission, translate, submissionMethod }),
    ].filter(Boolean),
    skjemanummer: form.properties?.skjemanummer,
    pdfConfig: {
      harInnholdsfortegnelse: false,
      språk: languageCode,
    },
    bunntekst: {
      upperleft:
        translate(TEXTS.statiske.footer.userIdLabel) +
        `: ${yourInformationUtils.getIdentityNumber(form, submission) ?? '—'}`,
      lowerleft: translate(TEXTS.statiske.footer.schemaNumberLabel) + `: ${form.properties?.skjemanummer}`,
      upperRight: null,
      upperMiddle:
        translate(TEXTS.statiske.footer.createdDatelabel) +
        `: ${dateUtils.toCurrentDayMonthYearHourMinute(languageCode)}`,
      lowerMiddle: translate(TEXTS.statiske.footer.versionLabel) + `: ${appConfig.config?.gitVersion ?? ''}`,
    },
    vannmerke: appConfig.config?.isDelingslenke ? 'Testskjema - Ikke send til Nav' : undefined,
  };
};

export default renderPdfForm;
