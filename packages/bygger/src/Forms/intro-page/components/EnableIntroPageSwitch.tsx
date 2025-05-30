import { Switch } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';

const useStyles = makeStyles({
  enableSwitch: {
    margin: '0 0 2rem 0',
  },
});

type Props = {
  form: Form;
  onChange: UpdateFormFunction;
};

export function EnableIntroPageSwitch({ form, onChange }: Props) {
  const styles = useStyles();
  return (
    <Switch
      checked={form.introPage?.enabled ?? false}
      onChange={(e) =>
        onChange({
          ...form,
          introPage: {
            ...form.introPage,
            enabled: e.target.checked,
          },
        })
      }
      size="small"
      className={styles.enableSwitch}
    >
      Bruk standard introside
    </Switch>
  );
}
