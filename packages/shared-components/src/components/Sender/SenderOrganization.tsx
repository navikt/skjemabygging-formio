import type { ChangeEvent } from 'react';
import { TextField } from '@navikt/ds-react';
import { SenderProps, SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';

const SenderOrganization = ({ labels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError } = useComponentUtils();

  const handleChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      organization: {
        ...value?.organization,
        [field]: e.currentTarget.value,
      },
    } as SubmissionSender);
  };

  return (
    <>
      <div className="form-group">
        <TextField
          label={translate(labels.organizationNumber)}
          description={translate(descriptions.organizationNumber)}
          value={value?.organization?.number ?? ''}
          onChange={(e) => handleChange('number', e)}
          ref={(ref) => addRef('sender:organizationNumber', ref)}
          error={getComponentError('sender:organizationNumber')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
      <div className="form-group">
        <TextField
          label={translate(labels.organizationName)}
          value={value?.organization?.name ?? ''}
          onChange={(e) => handleChange('name', e)}
          ref={(ref) => addRef('sender:organizationName', ref)}
          error={getComponentError('sender:organizationName')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
    </>
  );
};

export default SenderOrganization;
