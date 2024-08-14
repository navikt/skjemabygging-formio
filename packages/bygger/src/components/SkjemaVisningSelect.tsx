import { ToggleGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { DisplayType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from './FormMetaDataEditor/utils/utils';

interface Props {
  form: NavFormType;
  onChange: UpdateFormFunction;
}

const useStyles = makeStyles({
  toggleGroup: {
    marginTop: 'var(--a-spacing-2)',
  },
});

const SkjemaVisningSelect = ({ form, onChange }: Props) => {
  const { display } = form;
  const styles = useStyles();

  return (
    <ToggleGroup
      className={styles.toggleGroup}
      defaultValue={display}
      onChange={(value) => onChange({ ...form, display: value as DisplayType })}
      size="small"
    >
      <ToggleGroup.Item value="wizard">Veiviser</ToggleGroup.Item>
      <ToggleGroup.Item value="form">Skjema</ToggleGroup.Item>
    </ToggleGroup>
  );
};

export default SkjemaVisningSelect;
