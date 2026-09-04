import { ReadMore } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';

const PersonalIdUploadReadMore = () => {
  const { translate } = useLanguage();

  return (
    <ReadMore header={translate(TEXTS.statiske.uploadId.readMoreHeader)}>
      <ul>
        <li>{translate(TEXTS.statiske.uploadId.readMoreTypeOfId)}</li>
        <li>{translate(TEXTS.statiske.uploadId.readMoreName)}</li>
        <li>{translate(TEXTS.statiske.uploadId.readMoreDateOfBirth)}</li>
        <li>{translate(TEXTS.statiske.uploadId.readMoreValidity)}</li>
        <li>{translate(TEXTS.statiske.uploadId.readMoreImage)}</li>
        <li>{translate(TEXTS.statiske.uploadId.readMoreSignature)}</li>
      </ul>
    </ReadMore>
  );
};

export default PersonalIdUploadReadMore;
