import { Select } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";

async function fetchEnhetsListe(fyllutBaseURL) {
  return fetch(`${fyllutBaseURL}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.resolve([]);
  });
}

const EnhetSelector = ({ baseUrl, onSelectEnhet }) => {
  const [enhetsListe, setEnhetsListe] = useState([]);

  useEffect(() => {
    fetchEnhetsListe(baseUrl).then(setEnhetsListe);
  }, []);

  return (
    <Select label="Velg enhet" onChange={(event) => onSelectEnhet(event.target.value)}>
      {enhetsListe.map((enhet) => (
        <option key={enhet.enhetId} value={enhet.enhetId}>
          {enhet.navn}
        </option>
      ))}
    </Select>
  );
};

export default EnhetSelector;
