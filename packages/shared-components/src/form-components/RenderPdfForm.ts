import { Component, dateUtils, NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
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
  PdfNumber,
  PdfRadio,
  PdfSelect,
  PdfSelectBoxes,
  PdfTextArea,
  PdfTextField,
} from './components/standard';
import { PdfActivities, PdfDataFetcher, PdfDrivingList, PdfMaalgruppe } from './components/system';
import renderPdfComponent from './render/RenderPdfComponent';

interface Props {
  form: NavFormType;
  activeComponents: Component[];
  translate: (text: string) => string;
  lang?: string;
  watermarkText?: string;
  identityNumber?: string;
  gitVersion?: string;
}

const renderPdfForm = ({
  form,
  activeComponents,
  translate,
  lang,
  watermarkText,
  gitVersion,
  identityNumber,
}: Props): string => {
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
    navSelect: PdfSelect,
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
    panel: PdfPanel,
    row: PdfRow,

    /* System */
    activities: PdfActivities,
    dataFetcher: PdfDataFetcher,
    drivinglist: PdfDrivingList,
    maalgruppe: PdfMaalgruppe,
  };

  const languageCode: string = lang === 'nn-NO' || lang == 'nn' ? 'nn' : lang === 'en' ? 'en' : 'nb';

  const pdfData = {
    label: translate(form.title),
    verdiliste: [
      PdfIntroPage(),
      ...activeComponents
        .map((component) =>
          renderPdfComponent({
            component,
            submissionPath: '',
            componentRegistry,
          }),
        )
        .filter(Boolean),
      PdfSignature({ properties: form.properties }),
    ].filter(Boolean),
    skjemanummer: form.properties?.skjemanummer,
    pdfConfig: {
      harInnholdsfortegnelse: false,
      språk: languageCode,
    },
    bunntekst: {
      upperleft: translate(TEXTS.statiske.footer.userIdLabel) + `: ${identityNumber ?? '-'}`,
      lowerleft: translate(TEXTS.statiske.footer.schemaNumberLabel) + `: ${form.properties?.skjemanummer}`,
      upperRight: null,
      upperMiddle:
        translate(TEXTS.statiske.footer.createdDatelabel) +
        `: ${dateUtils.toCurrentDayMonthYearHourMinute(languageCode)}`,
      lowerMiddle: translate(TEXTS.statiske.footer.versionLabel) + `: ${gitVersion ?? ''}`,
    },
    vannmerke: watermarkText,
  };

  return JSON.stringify(pdfData).replaceAll('\\t', '  ');
};

export default renderPdfForm;
