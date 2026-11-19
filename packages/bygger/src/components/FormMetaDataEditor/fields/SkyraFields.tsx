import { TextField } from '@navikt/ds-react';
import { Form, FormSettingsDiff } from '@navikt/skjemadigitalisering-shared-domain';
import LabelWithDiff from '../LabelWithDiff';
import { UpdateFormFunction } from '../utils/utils';

interface Props {
  onChange: UpdateFormFunction;
  diff: FormSettingsDiff;
  form: Form;
}

const SkyraFields = ({ onChange, diff, form }: Props) => {
  const { skyraSlug } = form.properties;
  const isLockedForm = !!form.lock;

  return (
    <TextField
      className="mb"
      id="skyraSlug"
      label={<LabelWithDiff label="Skyra slug" diff={!!diff.skyraSlug} />}
      description="Undersøkelsen vises på kvitteringssiden etter digital innsending. Den må være satt til Inline og publisert i Skyra."
      value={skyraSlug || ''}
      onChange={(event) =>
        onChange({
          ...form,
          properties: { ...form.properties, skyraSlug: event.target.value.trim() || undefined },
        })
      }
      readOnly={isLockedForm}
    />
  );
};

export default SkyraFields;
