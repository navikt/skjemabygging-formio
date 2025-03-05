import { Form, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import EnhetSettings from '../EnhetSettings';
import { UpdateFormFunction } from '../utils/utils';

export interface EnhetFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const EnhetFields = ({ onChange, form }: EnhetFieldsProps) => {
  const { submissionTypes, mottaksadresseId, enhetMaVelgesVedPapirInnsending, enhetstyper } = form.properties;
  const { isPaperSubmission, isDigitalSubmissionOnly } = submissionTypesUtils;
  const isLockedForm = !!form.lock;

  return (
    <>
      {isPaperSubmission(submissionTypes) && !isDigitalSubmissionOnly(submissionTypes) && !mottaksadresseId && (
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
