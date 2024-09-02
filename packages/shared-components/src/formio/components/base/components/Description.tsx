import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtml from '../../../../components/inner-html/InnerHtml';

type Props = { component?: Component; translate: any };

const Description = ({ component, translate }: Props) => {
  if (!component?.description) return undefined;

  return <InnerHtml content={translate(component?.description)} />;
};
export default Description;
