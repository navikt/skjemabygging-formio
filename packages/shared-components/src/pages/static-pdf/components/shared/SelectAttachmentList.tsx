import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import FormCheckboxes from './form/FormCheckboxes';

interface Props {
  attachments: Component[];
  required: boolean;
  submissionPath: string;
}

const SelectAttachmentList = ({ submissionPath, attachments, required }: Props) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <FormCheckboxes
      legend={TEXTS.statiske.attachment.title}
      description={TEXTS.statiske.attachment.selectAttachments}
      submissionPath={submissionPath}
      validators={{ required }}
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
