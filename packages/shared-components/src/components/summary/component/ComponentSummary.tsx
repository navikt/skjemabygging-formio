import {
  SummaryActivity,
  SummaryAddress,
  SummaryAttachment,
  SummaryComponent,
  SummaryDrivingList,
  SummaryField as SummaryFieldType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import ActivitySummary from '../activity/ActivitySummary';
import AddressSummary from '../address/AddressSummary';
import AttachmentSummary from '../attachment/AttachmentSummary';
import DataGridSummary from '../datagrid/DataGridSummary';
import DrivingListSummary from '../drivingList/DrivingListSummary';
import SummaryField from '../field/SummaryField';
import FieldsetSummary from '../fieldset/FieldsetSummary';
import PanelSummary from '../panel/PanelSummary';
import SelectBoxesSummary from '../select-boxes/SelectBoxesSummary';

interface Props {
  components: SummaryComponent[];
  panelValidationList?: PanelValidation[];
}

const ComponentSummary = ({ components, panelValidationList = [] }: Props) => {
  return (
    <>
      {components
        .filter((comp) => !comp.hiddenInSummary)
        .map((comp) => {
          const { type, key } = comp;
          switch (type) {
            case 'panel': {
              const panelValidation = panelValidationList!.find((panelValidation) => panelValidation.key === key);
              const hasValidationErrors = !!panelValidation?.hasValidationErrors;
              return <PanelSummary key={key} component={comp} hasValidationErrors={hasValidationErrors} />;
            }
            case 'fieldset':
            case 'navSkjemagruppe':
              return <FieldsetSummary key={key} component={comp} />;
            case 'datagrid':
              return <DataGridSummary key={key} component={comp} />;
            case 'dataFetcher':
            case 'selectboxes':
              return <SelectBoxesSummary key={key} component={comp} />;
            case 'htmlelement':
            case 'alertstripe':
            case 'phoneNumber':
              return <SummaryField key={key} component={comp as SummaryFieldType} html={true} />;
            case 'attachment':
              return <AttachmentSummary key={key} component={comp as SummaryAttachment} />;
            case 'activities':
              return <ActivitySummary key={key} component={comp as SummaryActivity} />;
            case 'drivinglist':
              return <DrivingListSummary key={key} component={comp as SummaryDrivingList} />;
            case 'navAddress':
              return <AddressSummary key={key} component={comp as SummaryAddress} />;
            default:
              return <SummaryField key={key} component={comp as SummaryFieldType} />;
          }
        })}
    </>
  );
};

export default ComponentSummary;
