import { Accordion, Button, TextField } from "@navikt/ds-react";

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
    <Accordion className="mb">
      <Accordion.Item>
        <Accordion.Header>{`Antall ubrukte oversettelser: ${translations.length}`}</Accordion.Header>
        <Accordion.Content>
          {translations.map((t) => (
            <div key={t.id} className="mb-4">
              <TextField className="mb-4" disabled label={t.originalText} value={t.translatedText} />
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
