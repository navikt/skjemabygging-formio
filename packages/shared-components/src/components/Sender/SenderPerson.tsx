import { TextField } from '@navikt/ds-react';
import { SenderProps, SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';

const SenderPerson = ({ labels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError } = useComponentUtils();

  const handleChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      person: {
        ...value?.person,
        [field]: e.currentTarget.value,
      },
    } as SubmissionSender);
  };

  return (
    <>
      <div className="form-group">
        <TextField
          label={translate(labels.nationalIdentityNumber)}
          description={translate(descriptions.nationalIdentityNumber)}
          value={value?.person?.nationalIdentityNumber ?? ''}
          onChange={(e) => handleChange('nationalIdentityNumber', e)}
          ref={(ref) => addRef('sender:nationalIdentityNumber', ref)}
          error={getComponentError('sender:nationalIdentityNumber')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
      <div className="form-group">
        <TextField
          label={translate(labels.firstName)}
          value={value?.person?.firstName ?? ''}
          onChange={(e) => handleChange('firstName', e)}
          ref={(ref) => addRef('sender:firstName', ref)}
          error={getComponentError('sender:firstName')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
      <div className="form-group">
        <TextField
          label={translate(labels.surname)}
          value={value?.person?.surname ?? ''}
          onChange={(e) => handleChange('surname', e)}
          ref={(ref) => addRef('sender:surname', ref)}
          error={getComponentError('sender:surname')}
          readOnly={readOnly}
          className={styles.fieldSize}
        />
      </div>
    </>
  );
};

export default SenderPerson;
