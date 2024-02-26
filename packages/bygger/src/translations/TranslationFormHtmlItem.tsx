import { Box } from '@navikt/ds-react';
import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  htmlUtils,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useState } from 'react';
import TranslationFormHtmlInput from './TranslationFormHtmlInput';

interface Props {
  text: string;
  htmlElementAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  storedTranslation?: HtmlAsJsonElement | HtmlAsJsonTextElement;
  updateTranslation: (text: string) => void;
}

const useStyles = makeStyles({
  outerBox: {
    marginBottom: '1rem',
  },
  divider: {
    border: '1px solid var(--a-border-divider)',
  },
});
const TranslationFormHtmlItem = ({ text, htmlElementAsJson, storedTranslation, updateTranslation }: Props) => {
  const [currentTranslation, setCurrentTranslation] = useState<HtmlAsJsonElement | HtmlAsJsonTextElement>();
  useEffect(() => {
    if (!currentTranslation) {
      setCurrentTranslation(storedTranslation);
    }
  }, [currentTranslation, storedTranslation]);

  const styles = useStyles();

  if (htmlElementAsJson.type === 'Element') {
    return (
      <Box
        className={styles.outerBox}
        padding="2"
        paddingInline="4"
        borderRadius="xlarge"
        background="surface-alt-3-subtle"
        borderColor="border-alt-3"
        borderWidth="2"
      >
        {text && <div dangerouslySetInnerHTML={{ __html: text }} />}
        {currentTranslation && (
          <div
            dangerouslySetInnerHTML={{ __html: htmlUtils.json2HtmlString(currentTranslation as HtmlAsJsonElement) }}
          />
        )}
        {htmlElementAsJson.children.map((element, index) => {
          const translationChild =
            currentTranslation?.type === 'Element' ? currentTranslation.children[index] : undefined;
          return (
            <TranslationFormHtmlInput
              key={`html-translation-${element.id}`}
              text={element['textContent'] ?? ''}
              htmlElementAsJson={element}
              currentTranslation={translationChild}
              updateTranslation={(element) => {
                const updatedTranslation = currentTranslation;
                if (updatedTranslation && updatedTranslation?.type === 'Element') {
                  updatedTranslation.children[index] = element;
                  setCurrentTranslation(updatedTranslation);
                  updateTranslation(htmlUtils.json2HtmlString(updatedTranslation));
                }
              }}
            />
          );
        })}
      </Box>
    );
  }

  return <></>;
};

export default TranslationFormHtmlItem;
