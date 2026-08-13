import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtmlLong } from '../../fyllut-components/Html';

interface Props {
  description: string;
  translate: TranslateFunction;
  className?: string;
  setSelfDeclaration?: (selfDeclaration: boolean) => void;
  error?: string;
  value?: boolean;
}

const SelfDeclaration = ({ description, className, translate, error, setSelfDeclaration, value }: Props) => {
  if (!description) {
    return null;
  }

  return (
    <div className={className}>
      <InnerHtmlLong content={translate(description)} />
      <CheckboxGroup
        legend="introPage.selfDeclaration.inputLabel"
        hideLegend
        error={error}
        value={value ? ['selfDeclaration'] : []}
      >
        <Checkbox
          value="selfDeclaration"
          onChange={(event) => setSelfDeclaration?.(event.target.checked)}
          error={!!error}
        >
          {translate('introPage.selfDeclaration.inputLabel')}
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export default SelfDeclaration;
