import { Summary } from "@navikt/skjemadigitalisering-shared-domain";
import { PanelValidation } from "../../util/panelValidation";
import DataGridSummary from "./DataGridSummary";
import FieldsetSummary from "./FieldsetSummary";
import ImageSummary from "./ImageSummary";
import PanelSummary from "./PanelSummary";
import SelectBoxesSummary from "./SelectBoxesSummary";
import SummaryField from "./SummaryField";

interface Props {
  components: Summary.Component[];
  formUrl?: string;
  panelValidationList?: PanelValidation[];
}

const ComponentSummary = ({ components, formUrl = "", panelValidationList = [] }: Props) => {
  return (
    <>
      {components.map((comp) => {
        const { type, key } = comp;
        switch (type) {
          case "panel":
            const panelValidation = panelValidationList!.find((panelValidation) => panelValidation.key === key);
            const hasValidationErrors = !!panelValidation?.hasValidationErrors;
            return (
              <PanelSummary key={key} component={comp} formUrl={formUrl} hasValidationErrors={hasValidationErrors} />
            );
          case "fieldset":
          case "navSkjemagruppe":
            return <FieldsetSummary key={key} component={comp} />;
          case "datagrid":
            return <DataGridSummary key={key} component={comp} />;
          case "selectboxes":
            return <SelectBoxesSummary key={key} component={comp} />;
          case "image":
            return <ImageSummary key={key} component={comp} />;
          default:
            return <SummaryField key={key} component={comp as Summary.Field} />;
        }
      })}
    </>
  );
};

export default ComponentSummary;
