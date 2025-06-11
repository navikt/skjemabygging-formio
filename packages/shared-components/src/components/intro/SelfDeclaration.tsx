import { Checkbox } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import { InnerHtml } from '../../index';

interface Props {
  description: string;
  className?: string;
}

const SelfDeclaration = ({ description, className }: Props) => {
  const { translate } = useLanguages();

  if (!description) {
    return null;
  }

  return (
    <div className={className}>
      <InnerHtml content={translate(description)} />

      <Checkbox>{translate(TEXTS.grensesnitt.introPage.selfDeclaration)}</Checkbox>
    </div>
  );
};

export default SelfDeclaration;
