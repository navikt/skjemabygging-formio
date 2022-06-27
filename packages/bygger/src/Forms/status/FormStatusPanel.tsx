import { ClassNameMap } from "@material-ui/styles";
import Panel from "nav-frontend-paneler";
import { Element } from "nav-frontend-typografi";
import React from "react";
import FormStatus, { determineStatus } from "./FormStatus";
import PublishedLanguages from "./PublishedLanguages";
import { useStatusStyles } from "./styles";
import Timestamp from "./Timestamp";
import { Props } from "./types";

const FormStatusPanel = ({ formProperties }: Props) => {
  const styles: ClassNameMap = useStatusStyles();
  const { modified, modifiedBy, published, publishedBy, unpublished, unpublishedBy } = formProperties;

  return (
    <Panel className={styles.container}>
      <div className={styles.panelItem}>
        <Element>Status:</Element>
        <FormStatus status={determineStatus(formProperties)} size="large" />
      </div>
      <Timestamp label="Sist lagret:" timestamp={modified} userName={modifiedBy} />
      <Timestamp label="Sist publisert:" timestamp={published} userName={publishedBy} />
      <Timestamp label="Apublisert:" timestamp={unpublished} userName={unpublishedBy} />
      <PublishedLanguages formProperties={formProperties} />
    </Panel>
  );
};

export default FormStatusPanel;
