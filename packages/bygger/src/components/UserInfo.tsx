import { People } from "@navikt/ds-icons";
import React from "react";
import { useAuth } from "../context/auth-context";

const UserInfo = () => {
  const { userData } = useAuth();
  if (userData) {
    return <People title={`${userData.name || userData.data?.email} (${userData.NAVident || "formio-internal"})`} />;
  }
  return null;
};

export default UserInfo;
