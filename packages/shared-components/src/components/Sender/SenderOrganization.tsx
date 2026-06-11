import { TextField } from '@navikt/ds-react';
import { formatUtils, SenderProps, SubmissionSender } from '@navikt/skjemadigitalisering-shared-domain';
import type { ChangeEvent } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';
import InnerHtml from '../inner-html/InnerHtml';

const SenderOrganization = ({ customLabels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError } = useComponentUtils();

  const handleChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = field === 'number' ? formatUtils.removeAllSpaces(e.currentTarget.value) : e.currentTarget.value;

    onChange({
      ...value,
      organization: {
        ...value?.organization,
        [field]: nextValue,
      },
    } as SubmissionSender);
  };

  return (
    <>
      <div className="form-group">
        <TextField
          label={translate(customLabels.organizationNumber)}
          description={<InnerHtml content={translate(descriptions.organizationNumber)} />}
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
          label={translate(customLabels.organizationName)}
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
