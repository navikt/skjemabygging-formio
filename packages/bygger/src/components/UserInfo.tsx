import { makeStyles } from "@material-ui/styles";
import { People } from "@navikt/ds-icons";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { useAuth } from "../context/auth-context";

const useStyles = makeStyles({
  userName: {
    whiteSpace: "nowrap",
  },
});

const UserInfo = () => {
  const { userData } = useAuth();
  const { config } = useAppConfig();
  const styles = useStyles();
  if (userData) {
    return (
      <>
        <People title={`${userData.name || userData.data?.email} (${userData.NAVident || "formio-internal"})`} />
        {!config?.isDevelopment && <div className={styles.userName}>{`${userData.name} (${userData.NAVident})`}</div>}
      </>
    );
  }
  return null;
};

export default UserInfo;
