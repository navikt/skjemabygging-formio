import { Fieldset as AkselFieldset, Box } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
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
    <Box marginBlock="space-0 space-40">
      <AkselFieldset
        legend={translate(legend)}
        description={<TranslatedDescription>{description}</TranslatedDescription>}
        hideLegend={hideLegend}
      >
        {children}
      </AkselFieldset>
    </Box>
  );
};

export default Fieldset;
export type { FieldsetProps };
