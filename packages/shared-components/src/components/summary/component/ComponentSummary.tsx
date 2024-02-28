import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
import { PanelValidation } from '../../../util/form/panel-validation/panelValidation';
import ActivitySummary from '../activity/ActivitySummary';
import DataGridSummary from '../datagrid/DataGridSummary';
import DrivingListSummary from '../drivingList/DrivingListSummary';
import SummaryField from '../field/SummaryField';
import FieldsetSummary from '../fieldset/FieldsetSummary';
import ImageSummary from '../image/ImageSummary';
import PanelSummary from '../panel/PanelSummary';
import SelectBoxesSummary from '../select-boxes/SelectBoxesSummary';

interface Props {
  components: Summary.Component[];
  formUrl?: string;
  panelValidationList?: PanelValidation[];
}

const ComponentSummary = ({ components, formUrl = '', panelValidationList = [] }: Props) => {
  return (
    <>
      {components.map((comp) => {
        const { type, key } = comp;
        switch (type) {
          case 'panel':
            const panelValidation = panelValidationList!.find((panelValidation) => panelValidation.key === key);
            const hasValidationErrors = !!panelValidation?.hasValidationErrors;
            return (
              <PanelSummary key={key} component={comp} formUrl={formUrl} hasValidationErrors={hasValidationErrors} />
            );
          case 'fieldset':
          case 'navSkjemagruppe':
            return <FieldsetSummary key={key} component={comp} formUrl={formUrl} />;
          case 'datagrid':
            return <DataGridSummary key={key} component={comp} formUrl={formUrl} />;
          case 'selectboxes':
            return <SelectBoxesSummary key={key} component={comp} />;
          case 'image':
            return <ImageSummary key={key} component={comp} />;
          case 'htmlelement':
          case 'alertstripe':
            return <SummaryField key={key} component={comp as Summary.Field} html={true} />;
          case 'activities':
            return <ActivitySummary key={key} component={comp as Summary.Activity} />;
          case 'drivinglist':
            return <DrivingListSummary key={key} component={comp as Summary.DrivingList} />;
          default:
            return <SummaryField key={key} component={comp as Summary.Field} />;
        }
      })}
    </>
  );
};

export default ComponentSummary;
