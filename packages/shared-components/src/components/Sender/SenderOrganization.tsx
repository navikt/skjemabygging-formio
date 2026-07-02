import { Alert, TextField } from '@navikt/ds-react';
import { formatUtils, SenderProps, SubmissionSender, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import type { ChangeEvent, FocusEvent } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import useComponentStyle from '../../util/styles/useComponentStyle';
import InnerHtml from '../inner-html/InnerHtml';

const SenderOrganization = ({ customLabels, descriptions, value, onChange, readOnly, fieldSize }: SenderProps) => {
  const styles = useComponentStyle({
    fieldSize,
  });
  const { translate, addRef, getComponentError, appConfig } = useComponentUtils();

  const setOrganizationValue = (field: string, fieldValue: string) => {
    onChange({
      ...value,
      organization: {
        ...value?.organization,
        [field]: fieldValue,
      },
    } as SubmissionSender);
  };

  const handleChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    setOrganizationValue(field, e.currentTarget.value);
  };

  const handleOrganizationNumberBlur = (e: FocusEvent<HTMLInputElement>) => {
    setOrganizationValue('number', formatUtils.removeAllSpaces(e.currentTarget.value));
  };

  return (
    <>
      <div className="form-group">
        <TextField
          label={translate(customLabels.organizationNumber)}
          description={<InnerHtml content={translate(descriptions.organizationNumber)} />}
          value={value?.organization?.number ?? ''}
          onChange={(e) => handleChange('number', e)}
          onBlur={handleOrganizationNumberBlur}
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
      {(appConfig.submissionMethod === 'digital' || appConfig.submissionMethod === 'digitalnologin') && (
        <Alert variant="info">{translate(TEXTS.statiske.sender.applicationInsight)}</Alert>
      )}
    </>
  );
};

export default SenderOrganization;
