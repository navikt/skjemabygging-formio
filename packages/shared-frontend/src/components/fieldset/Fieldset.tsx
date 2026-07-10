import { Fieldset as AkselFieldset } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import FormElementBox from '../form-element-box/FormElementBox';
import TranslatedDescription from '../input/TranslatedDescription';

interface FieldsetProps {
  legend: string;
  description?: string;
  hideLegend?: boolean;
  children: ReactNode;
}

const Fieldset = ({ legend, description, hideLegend, children }: FieldsetProps) => {
  const { translate } = useLanguage();

  return (
    <FormElementBox marginBottom="space-40">
      <AkselFieldset
        legend={translate(legend)}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        hideLegend={hideLegend}
      >
        {children}
      </AkselFieldset>
    </FormElementBox>
  );
};

export default Fieldset;
export type { FieldsetProps };
