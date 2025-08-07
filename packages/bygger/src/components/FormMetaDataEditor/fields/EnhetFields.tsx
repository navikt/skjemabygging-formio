import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import {
  EnhetstypeNorg,
  Form,
  submissionTypesUtils,
  supportedEnhetstyper,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import EnhetSettings from '../EnhetSettings';
import { UpdateFormFunction } from '../utils/utils';

export interface EnhetFieldsProps {
  onChange: UpdateFormFunction;
  form: Form;
}

const EnhetFields = ({ onChange, form }: EnhetFieldsProps) => {
  const { submissionTypes, mottaksadresseId, enhetMaVelgesVedPapirInnsending, enhetstyper } = form.properties;
  const { http } = useAppConfig();
  const [enhetstyperNorg, setEnhetstyperNorg] = useState<EnhetstypeNorg[] | undefined>(undefined);
  const isLockedForm = !!form.lock;

  useEffect(() => {
    http!
      .get<EnhetstypeNorg[]>('/api/enhetstyper')
      .then((enhetstyper) => {
        setEnhetstyperNorg(enhetstyper.filter((type) => supportedEnhetstyper.includes(type.kodenavn)));
      })
      .catch((err) => console.log('Failed to fetch enhetstyper:', err));
  }, [http]);

  return (
    <>
      {submissionTypesUtils.isPaperSubmission(submissionTypes) && !mottaksadresseId && (
        <div className="mb">
          <EnhetSettings
            enhetstyperNorg={enhetstyperNorg}
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
