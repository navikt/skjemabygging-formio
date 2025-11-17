import { ToggleGroup } from '@navikt/ds-react';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  onToggle: (value: SubmissionMethod) => void;
}

const SubmissionMethodToggle = ({ onToggle }: Props) => {
  return (
    <ToggleGroup
      defaultValue="digital"
      onChange={(value) => onToggle(value as SubmissionMethod)}
      label="Visning for innsendingskanal"
    >
      <ToggleGroup.Item value="digital" label="Digital" />
      <ToggleGroup.Item value="paper" label="Papir" />
      <ToggleGroup.Item value="digitalnologin" label="Nologin" />
    </ToggleGroup>
  );
};

export default SubmissionMethodToggle;
