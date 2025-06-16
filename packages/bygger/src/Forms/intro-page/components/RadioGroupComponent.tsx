import { Radio, RadioGroup } from '@navikt/ds-react';
import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import { updateSection } from '../utils/utils';
import { IntroPageRefs } from '../validation/useIntroPageRefs';
import { IntroPageError } from '../validation/validation';

type Props = {
  legend: string;
  form: Form;
  field: keyof IntroPage['sections'];
  onChange: UpdateFormFunction;
  errors?: IntroPageError;
  refMap: IntroPageRefs;
  handleChange: UpdateFormFunction;
  values: string[];
};

// TODO bruke denne komponenten i Prerequisites.tsx, SelfDeclaration.tsx og DataDisclosure.tsx, Scope.tsx og OutOfScope.tsx når oversettelser er på plass
export function RadioGroupComponent({ legend, field, form, refMap, errors, handleChange, values }: Props) {
  return (
    <RadioGroup
      legend={legend}
      defaultValue={form.introPage?.sections?.[field]?.title}
      onChange={(value) => updateSection(form, field, 'title', value, handleChange)}
      error={errors?.sections?.[field]?.title}
    >
      {values.map((value, index) => (
        <Radio key={value} value={value} ref={index === 0 ? refMap[`sections.${field}.title`] : undefined}>
          {value}
        </Radio>
      ))}
    </RadioGroup>
  );
}
