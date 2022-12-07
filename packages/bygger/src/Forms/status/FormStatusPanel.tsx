import { ClassNameMap } from "@material-ui/styles";
import Panel from "nav-frontend-paneler";
import { Element } from "nav-frontend-typografi";
import React from "react";
import FormStatus, { determineStatus } from "./FormStatus";
import PublishedLanguages from "./PublishedLanguages";
import { useStatusStyles } from "./styles";
import Timestamp from "./Timestamp";
import { FormStatusPanelProps } from "./types";

const FormStatusPanel = ({ publishProperties }: FormStatusPanelProps) => {
  const styles: ClassNameMap = useStatusStyles();
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
    const styles = useStatusStyles();
    if (!timestamp) {
      return <></>;
    }
    return (
      <div className={styles.panelItem}>
        <Element>{label}</Element>
        <Timestamp timestamp={timestamp} />
        {userName && <p className={styles.rowText}>{userName}</p>}
      </div>
    );
  };

  return (
    <Panel className={styles.container}>
      <div className={styles.panelItem}>
        <Element>Status:</Element>
        <div className={styles.sidePanelFormStatusContainer}>
          <FormStatus status={determineStatus(publishProperties)} size="large" />
        </div>
      </div>
      <LabeledTimeAndUser label="Sist lagret:" timestamp={modified} userName={modifiedBy} />
      <LabeledTimeAndUser label="Sist publisert:" timestamp={published} userName={publishedBy} />
      <LabeledTimeAndUser label="Avpublisert:" timestamp={unpublished} userName={unpublishedBy} />
      <PublishedLanguages publishProperties={publishProperties} />
    </Panel>
  );
};

export default FormStatusPanel;
