import React, { useContext } from "react";
import { UserAlerterContext } from "../userAlerting";

const UserFeedback = () => {
  const userAlerter = useContext(UserAlerterContext).alertComponent();
  return <aside aria-live="polite">{userAlerter && userAlerter()}</aside>;
};

export default UserFeedback;
