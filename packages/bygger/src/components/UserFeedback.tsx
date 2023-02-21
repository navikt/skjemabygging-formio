import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import React, { useContext } from "react";
import { UserAlerterContext } from "../userAlerting";

const useStyles = makeStyles({
  alertstripe: {
    display: "flex",
  },
});

const UserFeedback = () => {
  const style = useStyles();
  const userAlerter = useContext(UserAlerterContext).alertComponent();
  return (
    <aside className={style.alertstripe} aria-live="polite">
      {userAlerter && userAlerter()}
    </aside>
  );
};

export default UserFeedback;
