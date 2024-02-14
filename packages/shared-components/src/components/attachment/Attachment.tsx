import { Alert, Textarea } from '@navikt/ds-react';
import { AttachmentSettingValues, AttachmentValue, ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useState } from 'react';
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
  value?: any;
  values?: ComponentValue[];
  attachmentValues?: AttachmentSettingValues;
  onChange: (value: AttachmentValue) => void;
}

const Attachment = ({ attachmentValues, values = [], value, title, description, error, onChange }: Props) => {
  const [showDeadline, setShowDeadline] = useState<boolean>(false);
  const [additionalDocumentation, setAdditionalDocumentation] = useState<any>('');

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

  const handleAttachmentChange = (key) => {
    updateState(key);
    onChange({
      ...value,
      key,
      description: AttachmentTexts[key],
    });
  };

  const handleAdditionalDocumentationChange = (event) => {
    onChange({
      ...value,
      additionalDocumentation: event.currentTarget.value,
    });
  };

  const updateState = (key: string) => {
    setShowDeadline(!!attachmentValues?.[key]?.showDeadline);
    setAdditionalDocumentation(
      attachmentValues?.[key]?.additionalDocumentation.enabled
        ? attachmentValues?.[key]?.additionalDocumentation
        : undefined,
    );
  };

  useEffect(() => {
    updateState(value?.key);
  }, [value]);

  return (
    <div>
      <SingleSelect
        values={getValues()}
        value={value?.key ?? ''}
        title={title}
        description={description}
        error={error}
        onChange={handleAttachmentChange}
      />
      {additionalDocumentation && (
        <Textarea
          className="mb-4"
          label={additionalDocumentation.label}
          value={value?.additionalDocumentation ?? ''}
          description={additionalDocumentation.description}
          onChange={handleAdditionalDocumentationChange}
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
