import { TextField } from '@navikt/ds-react';
import { formatUtils, SenderProps, SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';
import InnerHtml from '../inner-html/InnerHtml';

const SenderPerson = ({ customLabels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError } = useComponentUtils();

  const handleChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue =
      field === 'nationalIdentityNumber' ? formatUtils.removeAllSpaces(e.currentTarget.value) : e.currentTarget.value;

    onChange({
      ...value,
      person: {
        ...value?.person,
        [field]: nextValue,
      },
    } as SubmissionSender);
  };

  return (
    <>
      <div className="form-group">
        <TextField
          label={translate(customLabels.nationalIdentityNumber)}
          description={<InnerHtml content={translate(descriptions.nationalIdentityNumber)} />}
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
          label={translate(customLabels.firstName)}
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
          label={translate(customLabels.surname)}
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
