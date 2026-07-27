import { ReactNode } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import FormElementBox from '../shared/FormElementBox';
import TranslatedDescription from '../shared/TranslatedDescription';
import styles from './Fieldset.module.css';

interface FieldsetProps {
  legend: string;
  description?: string;
  hideLegend?: boolean;
  contentClassName?: string;
  children: ReactNode;
}

const Fieldset = ({ legend, description, hideLegend, contentClassName, children }: FieldsetProps) => {
  const { translate } = useLanguage();

  return (
    <FormElementBox marginBottom="space-40">
      <fieldset className={`aksel-fieldset ${styles.fieldset}`}>
        <legend
          className={['aksel-fieldset__legend-formio-template', hideLegend ? styles.hiddenLegend : undefined]
            .filter(Boolean)
            .join(' ')}
        >
          {translate(legend)}
        </legend>
        {description && (
          <div className={`description ${styles.description}`}>
            <TranslatedDescription>{description}</TranslatedDescription>
          </div>
        )}
        <div className={['aksel-fieldset__content', contentClassName].filter(Boolean).join(' ')}>{children}</div>
      </fieldset>
    </FormElementBox>
  );
};

export default Fieldset;
export type { FieldsetProps };
