import { ClassNameMap } from "@material-ui/styles";
import { Label, Panel } from "@navikt/ds-react";
import FormStatus, { determineStatus } from "./FormStatus";
import PublishedLanguages from "./PublishedLanguages";
import Timestamp from "./Timestamp";
import ToggleDiffButton from "./ToggleDiffButton";
import { useStatusStyles } from "./styles";
import { PublishProperties } from "./types";

interface Props {
  publishProperties: PublishProperties;
  spacing?: "default" | "small";
  hideToggleDiffButton?: boolean;
}

const FormStatusPanel = ({ publishProperties, spacing, hideToggleDiffButton = false }: Props) => {
  const styles: ClassNameMap = useStatusStyles({ spacing });
  const { modified, modifiedBy, published, publishedBy, unpublished, unpublishedBy } = publishProperties;

  const LabeledTimeAndUser = ({
    label,
    timestamp,
    userName,
  }: {
    label: string;
    timestamp?: string;
    userName?: string;
  }) => {
    const styles = useStatusStyles({ spacing });
    if (!timestamp) {
      return <></>;
    }
    return (
      <div className={styles.panelItem}>
        <Label>{label}</Label>
        <Timestamp timestamp={timestamp} />
        {userName && <p className={styles.rowText}>{userName}</p>}
      </div>
    );
  };

  return (
    <Panel className={styles.container}>
      <div className={styles.panelItem}>
        <Label>Status:</Label>
        <div className={styles.sidePanelFormStatusContainer}>
          <FormStatus status={determineStatus(publishProperties)} size="large" />
        </div>
        {!hideToggleDiffButton && published && <ToggleDiffButton className={styles.toggleDiffButton} />}
      </div>
      <LabeledTimeAndUser label="Sist lagret:" timestamp={modified} userName={modifiedBy} />
      <LabeledTimeAndUser label="Sist publisert:" timestamp={published} userName={publishedBy} />
      <LabeledTimeAndUser label="Avpublisert:" timestamp={unpublished} userName={unpublishedBy} />
      <PublishedLanguages publishProperties={publishProperties} />
    </Panel>
  );
};

export default FormStatusPanel;
