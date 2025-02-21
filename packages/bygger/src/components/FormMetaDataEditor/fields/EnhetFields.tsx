import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import EnhetSettings from '../EnhetSettings';
import { UpdateFormFunction } from '../utils/utils';

export interface EnhetFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const EnhetFields = ({ onChange, form }: EnhetFieldsProps) => {
  const innsending = form.properties.innsending || 'PAPIR_OG_DIGITAL';
  const mottaksadresseId = form.properties.mottaksadresseId;
  const enhetMaVelgesVedPapirInnsending = form.properties.enhetMaVelgesVedPapirInnsending;
  const enhetstyper = form.properties.enhetstyper;
  const isLockedForm = !!form.lock;

  return (
    <>
      {(innsending === 'KUN_PAPIR' || innsending === 'PAPIR_OG_DIGITAL') && !mottaksadresseId && (
        <div className="mb">
          <EnhetSettings
            enhetMaVelges={!!enhetMaVelgesVedPapirInnsending}
            selectedEnhetstyper={enhetstyper}
            readOnly={isLockedForm}
            onChangeEnhetMaVelges={(selected) =>
              onChange({
                ...form,
                properties: {
                  ...form.properties,
                  enhetMaVelgesVedPapirInnsending: selected,
                  enhetstyper: selected ? form.properties.enhetstyper : undefined,
                },
              })
            }
            onChangeEnhetstyper={(enhetstyper) =>
              onChange({ ...form, properties: { ...form.properties, enhetstyper } })
            }
          />
        </div>
      )}
    </>
  );
};

export default EnhetFields;
