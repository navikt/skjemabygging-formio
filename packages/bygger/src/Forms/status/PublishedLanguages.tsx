import { Element } from "nav-frontend-typografi";
import React from "react";
import { languagesInNorwegian } from "../../context/i18n";
import { useStatusStyles } from "./styles";
import { FormStatusPanelProps } from "./types";

const langCodeBokmal = "nb-NO";
export const allLanguagesInNorwegian = {
  ...languagesInNorwegian,
  [langCodeBokmal]: "Norsk bokmål",
};

const PublishedLanguages = ({ publishProperties }: FormStatusPanelProps) => {
  const styles = useStatusStyles();
  if (publishProperties.published && publishProperties.publishedLanguages) {
    const sortedLanguageCodes = [...publishProperties.publishedLanguages, langCodeBokmal].sort();
    return (
      <div className={styles.panelItem}>
        <Element>Publiserte språk:</Element>
        {sortedLanguageCodes.map((langCode) => {
          return (
            <p key={langCode} className={styles.rowText}>
              {allLanguagesInNorwegian[langCode]}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default PublishedLanguages;
