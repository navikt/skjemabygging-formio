import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { useComponentUtils } from '../../../../context/component/componentUtilsContext';

type Props = { component?: Component };

const Description = ({ component }: Props) => {
  const { translate } = useComponentUtils();
  if (!component?.description) return undefined;

  return <InnerHtml content={translate(component?.description)} />;
};
export default Description;
