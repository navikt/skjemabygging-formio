import { Switch } from '@navikt/ds-react';
import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { enableIntroPageSwitchStyles } from './styles';

type Props = {
  form: Form;
  onChange: UpdateFormFunction;
};

export function EnableIntroPageSwitch({ form, onChange }: Props) {
  const { introPage } = form;
  const styles = enableIntroPageSwitchStyles();
  return (
    <Switch
      checked={form.introPage?.enabled || false}
      onChange={(e) => {
        onChange({
          ...form,
          introPage: {
            ...introPage,
            enabled: e.target.checked,
          } as IntroPage,
        });
      }}
      size="small"
      className={styles.enableSwitch}
    >
      Bruk standard introside
    </Switch>
  );
}
