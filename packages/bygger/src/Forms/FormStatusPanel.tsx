import { FormPropertiesType } from "@navikt/skjemadigitalisering-shared-domain";
import moment from "moment";
import Panel from "nav-frontend-paneler";
import { Element } from "nav-frontend-typografi";
import React from "react";

type Status = "PENDING" | "DRAFT" | "PUBLISHED" | "STALE";

function determineStatus(modified, published): Status {
  if (modified && published) {
    if (moment(modified).isAfter(moment(published))) {
      return "PENDING";
    }
    return "PUBLISHED";
  }
  if (modified) {
    return "DRAFT";
  }
  return "STALE";
}

interface Props {
  formProperties: FormPropertiesType;
}

const StatusParagraph = ({ status }: { status: Status }) => {
  switch (status) {
    case "PUBLISHED":
      return <p>Publisert</p>;
    case "PENDING":
      return <p>Upubliserte endringer</p>;
    case "DRAFT":
      return <p>Utkast</p>;
    case "STALE":
    default:
      return <></>;
  }
};

const Timestamp = ({ label, timestamp }: { label: string; timestamp?: string }) => {
  if (!timestamp) {
    return <></>;
  }
  const timestampAsMoment = moment(timestamp);
  const dateAndTime = `${timestampAsMoment.format("DD.MM.YY")}, kl. ${timestampAsMoment.format("HH.mm")}`;
  return (
    <>
      <Element>{label}</Element>
      <p>{dateAndTime}</p>
    </>
  );
};

const FormStatusPanel = ({ formProperties }: Props) => {
  const { modified, published } = formProperties;
  const status = determineStatus(modified, published);

  return (
    <Panel>
      <Element>Status:</Element>
      <StatusParagraph status={status} />
      <Timestamp label={"Sist lagret:"} timestamp={modified} />
      <Timestamp label={"Sist publisert:"} timestamp={published} />
    </Panel>
  );
};

export default FormStatusPanel;
