import { AttachmentType, Component, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject } from 'react';

type AttachmentRefs = MutableRefObject<
  Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>
>;

interface AttachmentComponentConfig {
  navId: string;
  label: string;
  description?: string;
  attachmentValues?: Component['attachmentValues'];
  values?: Component['values'];
  attachmentType?: AttachmentType;
}

const setRef = (
  refs: AttachmentRefs | undefined,
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    refs.current[key] = value;
  }
};

export { setRef };
export type { AttachmentComponentConfig, AttachmentRefs, SubmissionAttachment };
