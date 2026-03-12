import { TextField } from '@navikt/ds-react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';
import { SenderProps, SubmissionSender } from './types';

const SenderOrganization = ({ labels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError } = useComponentUtils();

  const handleChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
          onChange={(e) => handleChange('organization', e)}
          ref={(ref) => addRef('sender:organization', ref)}
          error={getComponentError('sender:organization')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
      <div className="form-group">
        <TextField
          label={translate(labels.organizationName)}
          value={value?.organization?.name ?? ''}
          onChange={(e) => handleChange('organizationName', e)}
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
