import React from "react";

function getDokumentinnsendingBaseURL(naisClusterName) {
  const dokumentinnsendingProdURL = "https://tjenester.nav.no/dokumentinnsending";
  const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";

  if (naisClusterName === "prod-gcp") {
    return dokumentinnsendingProdURL;
  } else if (naisClusterName === "dev-gcp") {
    return dokumentinnsendingDevURL;
  } else {
    console.log(`Can't detect naiscluster, defaulting to ${dokumentinnsendingProdURL}`);
    return dokumentinnsendingProdURL;
  }
}

const AppConfigContext = React.createContext();

function AppConfigProvider({ children, naisClusterName }) {
  const dokumentinnsendingBaseURL = getDokumentinnsendingBaseURL(naisClusterName);
  return <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL }}>{children}</AppConfigContext.Provider>;
}

export { AppConfigProvider, AppConfigContext };
