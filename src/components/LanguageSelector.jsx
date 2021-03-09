import React from "react";
import { Select } from "nav-frontend-skjema";

const LanguageSelector = ({ changeLanguage, language }) => {
  return (
    <Select
      label="Velg oversettelser"
      name="form-language-select"
      id="form-language-select"
      value={language}
      onChange={(event) => changeLanguage(event.target.value)}
      bredde="s"
    >
      <option value="en">English</option>
      <option value="no">Norsk</option>
    </Select>
  );
};

export default LanguageSelector;
