import { Accordion, Button, TextField } from "@navikt/ds-react";
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
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>{`Antall ubrukte oversettelser: ${translations.length}`}</Accordion.Header>
        <Accordion.Content>
          {translations.map((t) => (
            <div key={t.id} className="margin-bottom-default">
              <TextField className="margin-bottom-default" disabled label={t.originalText} value={t.translatedText} />
              <Button variant="secondary" onClick={() => onDelete(t)} type="button">
                Slett
              </Button>
            </div>
          ))}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
};

export default ObsoleteTranslationsPanel;
