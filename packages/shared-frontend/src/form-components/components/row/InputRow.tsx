import { Box, Label } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { CSSProperties } from 'react';
import { useLanguage } from '../../../context/language/LanguageContext';
import RenderInputForm from '../../RenderInputForm';
import TranslatedDescription from '../../input/TranslatedDescription';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import styles from './InputRow.module.css';

interface InputRowProps {
  component: Component;
  pageKey: string;
  pageComponents: Component[];
  componentRegistry?: InputComponentRegistry;
}

const getChildStyle = (component: Component): CSSProperties | undefined => {
  if (!component.widthPercent || component.widthPercent <= 0 || component.widthPercent >= 100) {
    return undefined;
  }

  const width = `calc(${component.widthPercent}% - var(--ax-space-24))`;
  return {
    flexBasis: width,
    maxWidth: width,
  };
};

const InputRow = ({ component, pageKey, pageComponents, componentRegistry }: InputRowProps) => {
  const { translate } = useLanguage();
  const { components, label, hideLabel, description } = component;

  if (!components?.length) {
    return null;
  }

  return (
    <Box marginBlock="space-0 space-40">
      {!hideLabel && label && (
        <Label as="div" className={styles.label}>
          {translate(label)}
        </Label>
      )}
      {description && (
        <div className={styles.description}>
          <TranslatedDescription>{description}</TranslatedDescription>
        </div>
      )}
      <div className={styles.fields}>
        {components.map((childComponent) => (
          <div
            key={childComponent.navId ?? childComponent.key}
            className={styles.field}
            style={getChildStyle(childComponent)}
          >
            <RenderInputForm
              pageKey={pageKey}
              pageComponents={pageComponents}
              components={[childComponent]}
              componentRegistry={componentRegistry}
            />
          </div>
        ))}
      </div>
    </Box>
  );
};

export default InputRow;
