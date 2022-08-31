import Ekspanderbartpanel from "nav-frontend-ekspanderbartpanel";
import { Knapp } from "nav-frontend-knapper";
import { Input } from "nav-frontend-skjema";
import React from "react";

interface ObsoleteTranslation {
  id: string;
  originalText: string;
  translatedText: string;
}

interface Props {
  translations: ObsoleteTranslation[];
  className?: string;
  onDelete: (t: ObsoleteTranslation) => {};
}

const ObsoleteTranslationsPanel = ({ translations, className, onDelete }: Props) => {
  return (
    <Ekspanderbartpanel tittel={`Antall ubrukte oversettelser: ${translations.length}`} className={className}>
      {translations.map((t) => (
        <div key={t.id} className="margin-bottom-default">
          <Input className="margin-bottom-default" disabled label={t.originalText} value={t.translatedText} />
          <Knapp onClick={() => onDelete(t)}>Slett</Knapp>
        </div>
      ))}
    </Ekspanderbartpanel>
  );
};

export default ObsoleteTranslationsPanel;
