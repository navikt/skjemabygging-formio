import { ReadMore } from '@navikt/ds-react';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';
import { InnerHtml } from '../../../../index';

const AdditionalDescription = ({ component }) => {
  const { translate } = useComponentUtils();
  const { additionalDescriptionLabel, additionalDescriptionText } = component;
  if (!additionalDescriptionLabel || !additionalDescriptionText) return undefined;

  return (
    <ReadMore header={translate(additionalDescriptionLabel)}>
      <InnerHtml content={translate(additionalDescriptionText)} />
    </ReadMore>
  );
};

export default AdditionalDescription;
