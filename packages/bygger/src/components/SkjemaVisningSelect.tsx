import { ToggleGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { DisplayType } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  onChange: (value: DisplayType) => void;
}

const useStyles = makeStyles({
  toggleGroup: {
    marginTop: 'var(--ax-space-8)',
  },
});

const SkjemaVisningSelect = ({ onChange }: Props) => {
  const styles = useStyles();

  return (
    <ToggleGroup
      className={styles.toggleGroup}
      defaultValue={'wizard'}
      onChange={(value) => onChange(value as DisplayType)}
      size="small"
    >
      <ToggleGroup.Item value="wizard">Veiviser</ToggleGroup.Item>
      <ToggleGroup.Item value="form">Skjema</ToggleGroup.Item>
    </ToggleGroup>
  );
};

export default SkjemaVisningSelect;
