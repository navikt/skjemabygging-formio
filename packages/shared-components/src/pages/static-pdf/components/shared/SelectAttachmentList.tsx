import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentFormLink from '../../../../components/attachment/AttachmentFormLink';
import FormCheckboxes from './form/FormCheckboxes';

interface Props {
  attachments: Component[];
  submissionPath: string;
}

const SelectAttachmentList = ({ submissionPath, attachments }: Props) => {
  if (attachments.length === 0) {
    return null;
  }

  const attachmentsWithFormLink = attachments
    .map((attachment) => ({
      key: attachment.key,
      label: attachment.label,
      formPath: attachment.properties?.vedleggskjema,
    }))
    .filter((attachment): attachment is { key: string; label: string; formPath: string } => !!attachment.formPath);

  return (
    <>
      <FormCheckboxes
        legend={TEXTS.statiske.attachment.title}
        description={TEXTS.statiske.attachment.selectAttachments}
        submissionPath={submissionPath}
        validators={{ required: false }}
        values={attachments?.map(({ key, label }) => {
          return {
            value: key,
            label,
          };
        })}
      />
      {attachmentsWithFormLink.length > 0 && (
        <ul>
          {attachmentsWithFormLink.map((attachment) => (
            <li key={attachment.key}>
              <AttachmentFormLink formPath={attachment.formPath}>{attachment.label}</AttachmentFormLink>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default SelectAttachmentList;
