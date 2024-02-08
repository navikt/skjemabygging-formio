import { Alert, Textarea } from '@navikt/ds-react';
import { AttachmentValues, ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useState } from 'react';
import SingleSelect from '../single-select/SingleSelect';

export const AttachmentTexts = {
  leggerVedNaa: 'Jeg laster opp dette nå / Jeg legger det ved dette skjemaet',
  ettersender: 'Jeg laster opp dette senere / Jeg ettersender dokumentasjonen senere',
  nei: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved',
  levertTidligere: 'Jeg har levert denne dokumentasjonen tidligere',
  harIkke: 'Jeg har ikke denne dokumentasjonen',
  andre: 'Sendes inn av andre (for eksempel lege, arbeidsgiver)',
  nav: 'Jeg ønsker at NAV innhenter denne dokumentasjonen',
};

interface Props {
  title: ReactNode;
  description: ReactNode;
  error: ReactNode;
  values?: ComponentValue[];
  attachmentValues?: AttachmentValues;
  onChange: (value: any) => void;
}

const Attachment = ({ attachmentValues, values = [], title, description, error, onChange }: Props) => {
  const [showDeadline, setShowDeadline] = useState<boolean>();
  const [additionalDocumentation, setAdditionalDocumentation] = useState<any>();
  const getValues = () => {
    if (attachmentValues) {
      return Object.entries(attachmentValues)
        .map(([key, values]) => {
          if (!values.enabled) {
            return undefined;
          } else {
            return {
              value: key,
              label: AttachmentTexts[key],
            };
          }
        })
        .filter((values) => !!values) as ComponentValue[];
    }

    return values;
  };

  const handleChange = (value) => {
    if (attachmentValues && attachmentValues[value]) {
      setShowDeadline(attachmentValues[value].showDeadline);

      if (
        attachmentValues[value].additionalDocumentation?.enabled &&
        attachmentValues[value].additionalDocumentation?.label
      ) {
        setAdditionalDocumentation(attachmentValues[value].additionalDocumentation);
      } else if (additionalDocumentation) {
        setAdditionalDocumentation(undefined);
      }
    }
    onChange(value);
  };

  return (
    <div>
      <SingleSelect
        values={getValues()}
        title={title}
        description={description}
        error={error}
        onChange={handleChange}
      />
      {additionalDocumentation && (
        <Textarea
          className="mb-4"
          label={additionalDocumentation.label}
          description={additionalDocumentation.description}
        />
      )}
      {showDeadline && (
        <Alert variant="warning" inline>
          Hvis vi ikke har mottatt dette vedlegget innen vedleggsfrist! blir saken behandlet med de opplysningene som
          foreligger. Det kan føre til at saken din blir avslått.
        </Alert>
      )}
    </div>
  );
};

export default Attachment;
