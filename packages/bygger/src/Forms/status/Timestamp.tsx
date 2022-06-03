import moment from "moment";
import { Element } from "nav-frontend-typografi";
import React from "react";
import { useStatusStyles } from "./styles";

const Timestamp = ({ label, timestamp, userName }: { label: string; timestamp?: string; userName?: string }) => {
  const styles = useStatusStyles();
  if (!timestamp) {
    return <></>;
  }
  const timestampAsMoment = moment(timestamp);
  const dateAndTime = `${timestampAsMoment.format("DD.MM.YY")}, kl. ${timestampAsMoment.format("HH.mm")}`;
  return (
    <div className={styles.panelItem}>
      <Element>{label}</Element>
      <p className={styles.rowText}>{dateAndTime}</p>
      {userName && <p className={styles.rowText}>{userName}</p>}
    </div>
  );
};

export default Timestamp;
