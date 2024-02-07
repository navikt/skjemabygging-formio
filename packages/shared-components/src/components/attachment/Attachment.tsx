import { AttachmentValues, ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import SingleSelect from '../single-select/SingleSelect';

const AttachmentTexts = {
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
  values?: ComponentValue[];
  attachmentValues?: AttachmentValues;
}

const Attachment = ({ attachmentValues, values = [], title }: Props) => {
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

  return (
    <div>
      <SingleSelect values={getValues()} title={title} />
    </div>
  );
};

export default Attachment;
