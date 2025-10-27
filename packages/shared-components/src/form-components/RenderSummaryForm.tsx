import { useForm } from '../context/form/FormContext';
import { PanelValidation } from '../util/form/panel-validation/panelValidation';
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
  SummaryPhoneNumber,
  SummarySurname,
} from './components/customized';
import { SummaryDatePicker, SummaryMonthPicker, SummaryYear } from './components/date';
import { SummaryContainer, SummaryDataGrid, SummaryFormGroup, SummaryPanel, SummaryRow } from './components/group';
import { SummaryIntroPage } from './components/other';
import SummaryAttachmentUpload from './components/other/attachment-uploads/SummaryAttachmentUpload';
import {
  SummaryAccordion,
  SummaryAlert,
  SummaryCheckbox,
  SummaryHtmlElement,
  SummaryImage,
  SummaryNavSelect,
  SummaryNumber,
  SummaryRadio,
  SummarySelect,
  SummarySelectBoxes,
  SummaryTextArea,
  SummaryTextField,
} from './components/standard';
import { SummaryActivities, SummaryDataFetcher, SummaryDrivingList, SummaryMaalgruppe } from './components/system';
import RenderComponent from './render/RenderComponent';

interface Props {
  panelValidationList?: PanelValidation[];
}

const RenderSummaryForm = ({ panelValidationList }: Props) => {
  const { activeComponents, activeAttachmentUploadsPanel } = useForm();

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
    navSelect: SummaryNavSelect,
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
    phoneNumber: SummaryPhoneNumber,
    surname: SummarySurname,

    /* Date */
    navDatepicker: SummaryDatePicker,
    monthPicker: SummaryMonthPicker,
    year: SummaryYear,

    /* Group */
    container: SummaryContainer,
    datagrid: SummaryDataGrid,
    navSkjemagruppe: SummaryFormGroup,
    fieldset: SummaryFormGroup,
    panel: SummaryPanel,
    row: SummaryRow,

    /* System */
    activities: SummaryActivities,
    dataFetcher: SummaryDataFetcher,
    drivinglist: SummaryDrivingList,
    maalgruppe: SummaryMaalgruppe,
  };

  const attachmentUploadsComponentRegistry = {
    ...componentRegistry,
    attachment: SummaryAttachmentUpload,
  };

  return (
    <>
      <SummaryIntroPage />
      {activeComponents.map((component) => (
        <RenderComponent
          key={component.key}
          component={component}
          submissionPath=""
          componentRegistry={componentRegistry}
          panelValidationList={panelValidationList}
        />
      ))}
      {activeAttachmentUploadsPanel && (
        <RenderComponent
          component={activeAttachmentUploadsPanel}
          submissionPath=""
          componentRegistry={attachmentUploadsComponentRegistry}
          panelValidationList={panelValidationList}
        />
      )}
    </>
  );
};

export default RenderSummaryForm;
