import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description: string;
  translate: (key?: string) => string;
  className?: string;
  setSelfDeclaration?: (selfDeclaration: boolean) => void;
  error?: string;
}

const SelfDeclaration = ({ description, className, translate, error, setSelfDeclaration }: Props) => {
  if (!description) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />
      <CheckboxGroup legend={inputLabel} hideLegend error={error}>
        <Checkbox
          value={inputLabel}
          onChange={(event) => (setSelfDeclaration ? setSelfDeclaration(event.target.checked) : undefined)}
          error={!!error}
        >
          {translate(inputLabel)}
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export default SelfDeclaration;
