import { Button, Checkbox } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../utils/utils';

import { FilesIcon } from '@navikt/aksel-icons';
import { makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import copy from '../../../util/copy';

export interface TestSkjemaFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const useStyles = makeStyles({
  row: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  copyLink: {
    alignSelf: 'center',
  },
});

const TestSkjemaFields = ({ onChange, form }: TestSkjemaFieldsProps) => {
  const isTestForm = form.properties.isTestForm;
  const isLockedForm = !!form.lock;
  const path = form.path;

  const styles = useStyles();
  const { config } = useAppConfig();

  return (
    <>
      <div className={`mb ${styles.row}`}>
        <Checkbox
          id="teststatus"
          checked={!!isTestForm}
          onChange={(event) =>
            onChange({ ...form, properties: { ...form.properties, isTestForm: event.target.checked } })
          }
          readOnly={isLockedForm}
        >
          Dette er et testskjema
        </Checkbox>
        <span className={styles.copyLink}>
          Skjemadelingslenke
          <Button
            onClick={() => copy(`${config!.skjemadelingslenkeUrl}/test/login?formPath=${path}`)}
            icon={<FilesIcon aria-hidden />}
            title="Kopier skjemadelingslenke"
            variant="tertiary"
            size="xsmall"
          />
        </span>
      </div>
    </>
  );
};

export default TestSkjemaFields;
