import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../inner-html/InnerHtmlLong';

interface Props {
  description: string;
  translate: (key?: string) => string;
  className?: string;
  setSelfDeclaration?: (selfDeclaration: boolean) => void;
  error?: string;
  value?: boolean;
}

const SelfDeclaration = ({ description, className, translate, error, setSelfDeclaration, value }: Props) => {
  if (!description) {
    return null;
  }

  const inputLabel: Tkey = 'introPage.selfDeclaration.inputLabel';

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />
      <CheckboxGroup legend={inputLabel} hideLegend error={error} value={value ? ['selfDeclaration'] : []}>
        <Checkbox
          value="selfDeclaration"
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
