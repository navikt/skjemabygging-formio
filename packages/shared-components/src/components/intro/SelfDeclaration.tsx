import { Checkbox } from '@navikt/ds-react';
import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description: string;
  translate: (key?: string) => string;
  className?: string;
}

const SelfDeclaration = ({ description, translate, className }: Props) => {
  if (!description) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />

      <Checkbox>{translate(inputLabel)}</Checkbox>
    </div>
  );
};

export default SelfDeclaration;
