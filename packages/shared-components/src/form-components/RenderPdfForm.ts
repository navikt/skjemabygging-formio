import { dateUtils, SubmissionMethod, TEXTS, yourInformationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormContextType } from '../context/form/FormContext';
import { LanguageContextType } from '../context/languages/languages-context';
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
  formContextValue: FormContextType;
  languagesContextValue: LanguageContextType;
  isDelingslenke?: boolean;
  gitVersion?: string;
  submissionMethod?: SubmissionMethod;
}

const renderPdfForm = ({
  formContextValue,
  languagesContextValue,
  isDelingslenke,
  gitVersion,
  submissionMethod,
}: Props): PdfFormData => {
  const { currentLanguage, translate } = languagesContextValue;
  const { form, activeComponents, submission } = formContextValue;

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

  const languageCode: string =
    currentLanguage === 'nn-NO' || currentLanguage == 'nn' ? 'nn' : currentLanguage === 'en' ? 'en' : 'nb';

  return {
    label: translate(form.title),
    verdiliste: [
      PdfIntroPage({ languagesContextValue, formContextValue }),
      ...(activeComponents
        ?.map((component) =>
          renderPdfComponent({
            component,
            submissionPath: '',
            componentRegistry,
            formContextValue,
            languagesContextValue,
          }),
        )
        .filter(Boolean) ?? []),
      PdfSignature({ properties: form.properties, languagesContextValue, submissionMethod }),
    ].filter(Boolean),
    skjemanummer: form.properties?.skjemanummer,
    pdfConfig: {
      harInnholdsfortegnelse: false,
      språk: languageCode,
    },
    bunntekst: {
      upperleft:
        translate(TEXTS.statiske.footer.userIdLabel) + `: ${yourInformationUtils.getIdentityNumber(form, submission)}`,
      lowerleft: translate(TEXTS.statiske.footer.schemaNumberLabel) + `: ${form.properties?.skjemanummer}`,
      upperRight: null,
      upperMiddle:
        translate(TEXTS.statiske.footer.createdDatelabel) +
        `: ${dateUtils.toCurrentDayMonthYearHourMinute(languageCode)}`,
      lowerMiddle: translate(TEXTS.statiske.footer.versionLabel) + `: ${gitVersion ?? ''}`,
    },
    vannmerke: isDelingslenke ? 'Testskjema - Ikke send til Nav' : undefined,
  };
};

export default renderPdfForm;
