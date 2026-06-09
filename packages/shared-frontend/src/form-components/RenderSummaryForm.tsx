import {
  Component,
  Form,
  FormComponentType,
  Panel,
  PanelValidation,
  Submission,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import RenderComponent from './RenderComponent';
import SummaryAccordion from './components/accordion/SummaryAccordion';
import SummaryAccountNumber from './components/account-number/SummaryAccountNumber';
import SummaryActivities from './components/activities/SummaryActivities';
import SummaryAddressValidity from './components/address-validity/SummaryAddressValidity';
import SummaryAddress from './components/address/SummaryAddress';
import SummaryAlert from './components/alert/SummaryAlert';
import SummaryAttachmentUpload from './components/attachment-uploads/SummaryAttachmentUpload';
import SummaryAttachment from './components/attachment/SummaryAttachment';
import SummaryCheckbox from './components/checkbox/SummaryCheckbox';
import SummaryContainer from './components/container/SummaryContainer';
import SummaryCountrySelect from './components/country-select/SummaryCountrySelect';
import SummaryCurrencySelect from './components/currency-select/SummaryCurrencySelect';
import SummaryCurrency from './components/currency/SummaryCurrency';
import SummaryDataFetcher from './components/data-fetcher/SummaryDataFetcher';
import SummaryDataGrid from './components/data-grid/SummaryDataGrid';
import SummaryDatePicker from './components/date-picker/SummaryDatePicker';
import SummaryDrivingList from './components/driving-list/SummaryDrivingList';
import SummaryEmail from './components/email/SummaryEmail';
import SummaryFirstName from './components/first-name/SummaryFirstName';
import SummaryFormGroup from './components/form-group/SummaryFormGroup';
import SummaryHtmlElement from './components/html-element/SummaryHtmlElement';
import SummaryIban from './components/iban/SummaryIban';
import SummaryIdentity from './components/identity/SummaryIdentity';
import SummaryImage from './components/image/SummaryImage';
import SummaryIntroPage from './components/intro-page/SummaryIntroPage';
import SummaryMaalgruppe from './components/maalgruppe/SummaryMaalgruppe';
import SummaryMonthPicker from './components/month-picker/SummaryMonthPicker';
import SummaryNationalIdentityNumber from './components/national-identity-number/SummaryNationalIdentityNumber';
import SummaryNumber from './components/number/SummaryNumber';
import SummaryOrganizationNumber from './components/organization-number/SummaryOrganizationNumber';
import SummaryPanel from './components/panel/SummaryPanel';
import SummaryPassword from './components/password/SummaryPassword';
import SummaryPhoneNumber from './components/phone-number/SummaryPhoneNumber';
import SummaryRadio from './components/radio/SummaryRadio';
import SummaryRow from './components/row/SummaryRow';
import SummarySelectBoxes from './components/select-boxes/SummarySelectBoxes';
import SummaryNavSelect from './components/select/SummaryNavSelect';
import SummarySelect from './components/select/SummarySelect';
import SummarySender from './components/sender/SummarySender';
import SummarySurname from './components/surname/SummarySurname';
import SummaryTextArea from './components/text-area/SummaryTextArea';
import SummaryTextField from './components/text-field/SummaryTextField';
import SummaryYear from './components/year/SummaryYear';
import { FormComponentRegistry, HandleAttachmentDownloadFile, SummaryRendererAppConfig } from './types';

interface Props {
  activeComponents: Component[];
  activeAttachmentUploadsPanel?: Panel;
  submission?: Submission;
  form: Form;
  currentLanguage: string;
  translate: TranslateFunction;
  panelValidationList?: PanelValidation[];
  appConfig: SummaryRendererAppConfig;
  handleDownloadFile?: HandleAttachmentDownloadFile;
}

const RenderSummaryForm = ({
  activeComponents,
  activeAttachmentUploadsPanel,
  submission,
  form,
  currentLanguage,
  translate,
  panelValidationList,
  appConfig,
  handleDownloadFile,
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
    sender: SummarySender,
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
  } satisfies Record<FormComponentType, FormComponentRegistry[string]>;

  const attachmentUploadsComponentRegistry = {
    ...componentRegistry,
    attachment: SummaryAttachmentUpload,
    radiopanel: SummaryAttachmentUpload,
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
          appConfig={appConfig}
          handleDownloadFile={handleDownloadFile}
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
          appConfig={appConfig}
          handleDownloadFile={handleDownloadFile}
        />
      )}
    </>
  );
};

export type { Props as RenderSummaryFormProps };
export default RenderSummaryForm;
