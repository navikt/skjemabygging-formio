import { Fieldset as AkselFieldset } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import FormElementBox, { Spacing } from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import styles from './Fieldset.module.css';

interface FieldsetProps {
  legend: string;
  description?: string;
  hideLegend?: boolean;
  contentClassName?: string;
  inset?: boolean;
  marginBottom?: Spacing;
  children: ReactNode;
}

const Fieldset = ({
  legend,
  description,
  hideLegend,
  contentClassName,
  inset = true,
  marginBottom = 'space-40',
  children,
}: FieldsetProps) => {
  const { translate } = useLanguage();

  return (
    <FormElementBox marginBottom={marginBottom}>
      <AkselFieldset
        legend={<span className={styles.legend}>{translate(legend)}</span>}
        hideLegend={hideLegend}
        description={!hideLegend && description ? <TranslatedDescription translationKey={description} /> : undefined}
      >
        {hideLegend && description && <TranslatedDescription translationKey={description} />}
        <div
          className={[styles.content, inset ? styles.inset : undefined, contentClassName].filter(Boolean).join(' ')}
          data-cy="fieldset-content"
        >
          {children}
        </div>
      </AkselFieldset>
    </FormElementBox>
  );
};

export default Fieldset;
export type { FieldsetProps };
