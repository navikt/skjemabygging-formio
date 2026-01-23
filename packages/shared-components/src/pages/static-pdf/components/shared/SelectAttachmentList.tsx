import { Component, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import FormCheckbox from './FormCheckbox';

interface Props {
  submissionPath: string;
}

const SelectAttachmentList = ({ submissionPath }: Props) => {
  const { form } = useForm();
  const { translate } = useLanguages();

  const attachments: Component[] = useMemo(() => {
    return navFormUtils.flattenComponents(form.components).filter((component) => component.type === 'attachment');
  }, [form.components]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <FormCheckbox
      legend={translate(TEXTS.statiske.attachment.title)}
      description={translate(TEXTS.statiske.attachment.selectAttachments)}
      submissionPath={submissionPath}
      values={attachments?.map(({ key, label, description }) => {
        return {
          value: key,
          label,
          description,
        };
      })}
      validators={{
        required: false,
      }}
    />
  );
};

export default SelectAttachmentList;
