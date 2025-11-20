import {
  Component,
  Form,
  Panel,
  PanelValidation,
  Submission,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
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
  activeComponents: Component[];
  activeAttachmentUploadsPanel?: Panel;
  submission?: Submission;
  form: Form;
  currentLanguage: string;
  translate: TranslateFunction;
  panelValidationList?: PanelValidation[];
}

const RenderSummaryForm = ({
  activeComponents,
  activeAttachmentUploadsPanel,
  submission,
  form,
  currentLanguage,
  translate,
  panelValidationList,
}: Props) => {
  if (!submission) {
    return null;
  }

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
      <SummaryIntroPage form={form} submission={submission} translate={translate} />
      {activeComponents.map((component) => (
        <RenderComponent
          key={component.key}
          component={component}
          submissionPath=""
          componentRegistry={componentRegistry}
          submission={submission}
          translate={translate}
          currentLanguage={currentLanguage}
          formProperties={form.properties}
          panelValidationList={panelValidationList}
        />
      ))}
      {activeAttachmentUploadsPanel && (
        <RenderComponent
          component={activeAttachmentUploadsPanel}
          submissionPath=""
          componentRegistry={attachmentUploadsComponentRegistry}
          submission={submission}
          translate={translate}
          currentLanguage={currentLanguage}
          formProperties={form.properties}
          panelValidationList={panelValidationList}
        />
      )}
    </>
  );
};

export default RenderSummaryForm;
