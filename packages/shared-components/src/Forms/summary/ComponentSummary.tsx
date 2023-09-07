import { Summary } from "@navikt/skjemadigitalisering-shared-domain";
import DataGridSummary from "./DataGridSummary";
import FieldsetSummary from "./FieldsetSummary";
import ImageSummary from "./ImageSummary";
import PanelSummary from "./PanelSummary";
import SelectBoxesSummary from "./SelectBoxesSummary";
import SummaryField from "./SummaryField";

interface Props {
  components: Summary.Component[];
}

const ComponentSummary = ({ components }: Props) => {
  return (
    <>
      {components.map((comp) => {
        const { type, key } = comp;
        switch (type) {
          case "panel":
            return <PanelSummary key={key} component={comp} />;
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
