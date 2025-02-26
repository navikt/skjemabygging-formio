import { Form, isPaperSubmission } from '@navikt/skjemadigitalisering-shared-domain';
import EnhetSettings from '../EnhetSettings';
import { UpdateFormFunction } from '../utils/utils';

export interface EnhetFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const EnhetFields = ({ onChange, form }: EnhetFieldsProps) => {
  const submissionTypes = form.properties.submissionTypes;
  const mottaksadresseId = form.properties.mottaksadresseId;
  const enhetMaVelgesVedPapirInnsending = form.properties.enhetMaVelgesVedPapirInnsending;
  const enhetstyper = form.properties.enhetstyper;
  const isLockedForm = !!form.lock;

  return (
    <>
      {isPaperSubmission(submissionTypes) && !mottaksadresseId && (
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
