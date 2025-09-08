import { useForm } from '../context/form/FormContext';
import {
  SummaryAccountNumber,
  SummaryAddress,
  SummaryAddressValidity,
  SummaryAttachment,
  SummaryCountrySelect,
  SummaryCurrency,
  SummaryCurrencySelect,
  SummaryEmail,
  SummaryFirstName,
  SummaryIban,
  SummaryIdentity,
  SummaryNationalIdentityNumber,
  SummaryOrganizationNumber,
  SummaryPassword,
  SummaryPhoneNumer,
  SummarySurename,
} from './components/customized';
import { SummaryDatePicker, SummaryMonthPicker, SummaryYear } from './components/date';
import { SummaryContainer, SummaryDataGrid, SummaryFormGroup, SummaryPanel, SummaryRow } from './components/group';
import {
  SummaryAccordion,
  SummaryAlert,
  SummaryCheckbox,
  SummaryHtmlElement,
  SummaryImage,
  SummaryNumber,
  SummaryRadio,
  SummarySelect,
  SummarySelectBoxes,
  SummaryTextArea,
  SummaryTextField,
} from './components/standard';
import { SummaryActivities, SummaryDataFetcher, SummaryDrivingList, SummaryMaalgruppe } from './components/system';
import RenderComponent from './render/RenderComponent';

const FormSummary = () => {
  const { activeComponents } = useForm();

  const componentRegistry = {
    /* Standard */
    accordion: SummaryAccordion,
    alertstripe: SummaryAlert,
    navCheckbox: SummaryCheckbox,
    htmlelement: SummaryHtmlElement,
    image: SummaryImage,
    number: SummaryNumber,
    radiopanel: SummaryRadio,
    select: SummarySelect,
    navSelect: SummarySelect,
    selectboxes: SummarySelectBoxes,
    textarea: SummaryTextArea,
    formioTextArea: SummaryTextArea,
    textfield: SummaryTextField,

    /* Customized */
    bankAccount: SummaryAccountNumber,
    navAddress: SummaryAddress,
    addressValidity: SummaryAddressValidity,
    attachment: SummaryAttachment,
    landvelger: SummaryCountrySelect,
    currency: SummaryCurrency,
    valutavelger: SummaryCurrencySelect,
    email: SummaryEmail,
    firstName: SummaryFirstName,
    iban: SummaryIban,
    identity: SummaryIdentity,
    fnrfield: SummaryNationalIdentityNumber,
    orgNr: SummaryOrganizationNumber,
    password: SummaryPassword,
    phoneNumber: SummaryPhoneNumer,
    surname: SummarySurename,

    /* Date */
    navDatepicker: SummaryDatePicker,
    monthPicker: SummaryMonthPicker,
    year: SummaryYear,

    /* Group */
    container: SummaryContainer,
    datagrid: SummaryDataGrid,
    navSkjemagruppe: SummaryFormGroup,
    panel: SummaryPanel,
    row: SummaryRow,

    /* System */
    activities: SummaryActivities,
    dataFetcher: SummaryDataFetcher,
    drivinglist: SummaryDrivingList,
    maalgruppe: SummaryMaalgruppe,
  };

  return activeComponents.map((component) => (
    <RenderComponent
      key={component.key}
      component={component}
      submissionPath=""
      componentRegistry={componentRegistry}
    />
  ));
};

export default FormSummary;
