import { Link } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useAppConfig } from '../../context/config/configContext';
import { useLanguages } from '../../context/languages';
import { createAttachmentFormUrl } from '../../util/attachment/attachmentFormUrl';

interface Props {
  formPath: string;
  children: ReactNode;
}

const AttachmentFormLink = ({ formPath, children }: Props) => {
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();

  return (
    <>
      <Link href={createAttachmentFormUrl(fyllutBaseURL, formPath)} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>{' '}
      <span>{translate(TEXTS.common.opensInNewTab)}</span>
    </>
  );
};

export default AttachmentFormLink;
