import { Component, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useForm } from '../../../../context/form/FormContext';
import FormCheckboxes from './form/FormCheckboxes';

interface Props {
  submissionPath: string;
}

const SelectAttachmentList = ({ submissionPath }: Props) => {
  const { form } = useForm();

  const attachments: Component[] = useMemo(() => {
    return navFormUtils.flattenComponents(form.components).filter((component) => component.type === 'attachment');
  }, [form.components]);

  if (attachments.length === 0) {
    return null;
  }

  return (
    <FormCheckboxes
      legend={TEXTS.statiske.attachment.title}
      description={TEXTS.statiske.attachment.selectAttachments}
      submissionPath={submissionPath}
      values={attachments?.map(({ key, label }) => {
        return {
          value: key,
          label,
        };
      })}
    />
  );
};

export default SelectAttachmentList;
