import React, { useState, useEffect } from "react";

const AppConfigContext = React.createContext();
function AppConfigProvider({ children }) {
  const [dokumentinnsendingBaseURL, setDokumentinnsendingBaseURL] = useState(
    "https://tjenester.nav.no/dokumentinnsending"
  );

  useEffect(() => {
    try {
      fetch("/skjema/config")
        .then((config) => config.json())
        .then((json) => {
          if (json.NAIS_CLUSTER_NAME === "dev-gcp")
            setDokumentinnsendingBaseURL("https://tjenester-q0.nav.no/dokumentinnsending");
        });
    } catch {
      console.error("Could not fetch config from server");
    }
  }, []);
  return <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL }}>{children}</AppConfigContext.Provider>;
}

export { AppConfigProvider, AppConfigContext };
