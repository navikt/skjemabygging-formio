import {
  Component,
  dateUtils,
  Form,
  FormComponentType,
  Panel,
  PdfData,
  PdfFormData,
  Submission,
  SubmissionMethod,
  TEXTS,
  TranslateFunction,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import PdfAccordion from './components/accordion/PdfAccordion';
import PdfAccountNumber from './components/account-number/PdfAccountNumber';
import PdfActivities from './components/activities/PdfActivities';
import PdfAddressValidity from './components/address-validity/PdfAddressValidity';
import PdfAddress from './components/address/PdfAddress';
import PdfAlert from './components/alert/PdfAlert';
import PdfAttachmentUpload from './components/attachment-uploads/PdfAttachmentUpload';
import PdfAttachment from './components/attachment/PdfAttachment';
import PdfCheckbox from './components/checkbox/PdfCheckbox';
import PdfContainer from './components/container/PdfContainer';
import PdfCountrySelect from './components/country-select/PdfCountrySelect';
import PdfCurrencySelect from './components/currency-select/PdfCurrencySelect';
import PdfCurrency from './components/currency/PdfCurrency';
import PdfDataFetcher from './components/data-fetcher/PdfDataFetcher';
import PdfDataGrid from './components/data-grid/PdfDataGrid';
import PdfDatePicker from './components/date-picker/PdfDatePicker';
import PdfDrivingList from './components/driving-list/PdfDrivingList';
import PdfEmail from './components/email/PdfEmail';
import PdfFirstName from './components/first-name/PdfFirstName';
import PdfFormGroup from './components/form-group/PdfFormGroup';
import PdfHtmlElement from './components/html-element/PdfHtmlElement';
import PdfIban from './components/iban/PdfIban';
import PdfIdentity from './components/identity/PdfIdentity';
import PdfImage from './components/image/PdfImage';
import PdfIntroPage from './components/intro-page/PdfIntroPage';
import PdfMaalgruppe from './components/maalgruppe/PdfMaalgruppe';
import PdfMonthPicker from './components/month-picker/PdfMonthPicker';
import PdfNationalIdentityNumber from './components/national-identity-number/PdfNationalIdentityNumber';
import PdfNumber from './components/number/PdfNumber';
import PdfOrganizationNumber from './components/organization-number/PdfOrganizationNumber';
import PdfPanel from './components/panel/PdfPanel';
import PdfPassword from './components/password/PdfPassword';
import PdfPhoneNumber from './components/phone-number/PdfPhoneNumber';
import PdfRadio from './components/radio/PdfRadio';
import PdfRow from './components/row/PdfRow';
import PdfSelectBoxes from './components/select-boxes/PdfSelectBoxes';
import PdfNavSelect from './components/select/PdfNavSelect';
import PdfSelect from './components/select/PdfSelect';
import PdfSender from './components/sender/PdfSender';
import PdfSignature from './components/signature/PdfSignature';
import PdfSurname from './components/surname/PdfSurname';
import PdfTextArea from './components/text-area/PdfTextArea';
import PdfTextField from './components/text-field/PdfTextField';
import PdfYear from './components/year/PdfYear';
import renderPdfComponent from './RenderPdfComponent';
import { PdfComponentRegistry, PdfRendererAppConfig } from './types';

interface Props {
  activeComponents: Component[];
  activeAttachmentUploadsPanel?: Panel;
  submission?: Submission;
  form: Form;
  currentLanguage: string;
  translate: TranslateFunction;
  submissionMethod?: SubmissionMethod | undefined;
  appConfig: PdfRendererAppConfig;
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
    sender: PdfSender,
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
  } satisfies Record<FormComponentType, PdfComponentRegistry[string]>;

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
            submissionMethod,
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
              submissionMethod,
            }),
          ]
        : []),
      PdfSignature({ properties: form.properties, submission, translate, submissionMethod }),
    ].filter(Boolean) as PdfData[],
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
