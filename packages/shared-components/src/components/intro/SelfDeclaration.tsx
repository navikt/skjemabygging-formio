import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description: string;
  className?: string;
  translate: (textOrKey?: string | Tkey, params?: Record<string | number, any>) => string;
  setSelfDeclaration?: (selfDeclaration: boolean) => void;
  error?: string;
}

const SelfDeclaration = ({ description, className, translate, error, setSelfDeclaration }: Props) => {
  const label = translate(TEXTS.grensesnitt.introPage.selfDeclaration);
  if (!description) {
    return null;
  }

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />
      <CheckboxGroup legend={label} hideLegend error={error}>
        <Checkbox
          onChange={(event) => (setSelfDeclaration ? setSelfDeclaration(event.target.checked) : undefined)}
          error={!!error}
        >
          {translate(TEXTS.grensesnitt.introPage.selfDeclaration)}
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export default SelfDeclaration;
