import { ReadMore } from '@navikt/ds-react';
import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';

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
