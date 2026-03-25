import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import editFormWysiwygEditor from '../shared/editFormWysiwygEditor';

interface Props {
  key?: string;
  label?: string;
  customConditional?: string;
}

const editFormDescription = ({
  key = 'description',
  label = 'Beskrivelse',
  customConditional,
}: Props = {}): Component => {
  return {
    ...editFormWysiwygEditor(false),
    key,
    label,
    customConditional,
    validate: {
      maxLength: 4000,
    },
  };
};

export default editFormDescription;
