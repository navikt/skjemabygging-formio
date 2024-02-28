import { PlusIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Heading, HStack, VStack } from '@navikt/ds-react';
import Divider from '@navikt/ds-react/esm/dropdown/Menu/Divider';
import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  htmlUtils,
  makeStyles,
} from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useMemo, useState } from 'react';
import TranslationFormHtmlInput from './TranslationFormHtmlInput';

interface Props {
  text: string;
  htmlElementAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  storedTranslation: string;
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

const isSameStructure = (
  elementTreeA?: HtmlAsJsonElement | HtmlAsJsonTextElement,
  elementTreeB?: HtmlAsJsonElement | HtmlAsJsonTextElement,
) => {
  if (!elementTreeA || !elementTreeB) {
    return false;
  }
  if (elementTreeA.type === 'Element' && elementTreeB.type === 'Element') {
    if (elementTreeA.tagName !== elementTreeB.tagName) {
      return false;
    }
    return elementTreeA.children.every((childA, index) => {
      return elementTreeB.children.length > index && isSameStructure(childA, elementTreeB.children[index]);
    });
  }
  return elementTreeA.type === elementTreeB.type;
};

const TranslationFormHtmlItem = ({ text, htmlElementAsJson, storedTranslation, updateTranslation }: Props) => {
  const [currentTranslation, setCurrentTranslation] = useState<HtmlAsJsonElement | HtmlAsJsonTextElement>();

  const translationIsMissing = useMemo(
    () => !currentTranslation && (!storedTranslation || !htmlUtils.isHtmlString(storedTranslation)),
    [currentTranslation, storedTranslation],
  );
  const incompatibleTranslationExists = useMemo(() => {
    if (!currentTranslation) {
      const storedTranslationAsJson =
        !!storedTranslation && htmlUtils.isHtmlString(storedTranslation)
          ? htmlUtils.htmlString2Json(storedTranslation)
          : undefined;
      return storedTranslationAsJson && !isSameStructure(htmlElementAsJson, storedTranslationAsJson);
    }
  }, [currentTranslation, htmlElementAsJson, storedTranslation]);

  useEffect(() => {
    if (!currentTranslation && !translationIsMissing && !incompatibleTranslationExists) {
      setCurrentTranslation(htmlUtils.htmlString2Json(storedTranslation));
    }
  }, [currentTranslation, incompatibleTranslationExists, storedTranslation, translationIsMissing]);

  const styles = useStyles();

  const startNewTranslation = () => {
    setCurrentTranslation(htmlElementAsJson);
  };

  const useIncompatibleTranslation = () => {
    setCurrentTranslation(htmlUtils.htmlString2Json(storedTranslation));
  };

  if (htmlElementAsJson.type === 'Element') {
    return (
      <Box
        className={styles.outerBox}
        padding="2"
        paddingInline="4"
        borderRadius="xlarge"
        background="bg-subtle"
        borderColor="border-default"
        borderWidth="2"
      >
        <div dangerouslySetInnerHTML={{ __html: text }} />
        <Divider />
        {translationIsMissing && (
          <VStack gap="4" align="start">
            <Alert size="small" variant="warning">
              Oversettelse mangler. Klikk start ny for å begynne å legge til ny oversettelse
            </Alert>
            <Button size="small" variant="primary" onClick={startNewTranslation} icon={<PlusIcon aria-hidden />}>
              Start ny oversettelse
            </Button>
          </VStack>
        )}
        {incompatibleTranslationExists && (
          <VStack gap="4" align="start">
            <Divider color="border-default" />
            <Heading size={'xsmall'}>Teksten har en eksisterende oversettelse som ikke følger samme struktur</Heading>
            <div dangerouslySetInnerHTML={{ __html: storedTranslation }} />
            <HStack gap="6">
              <Button size="small" variant="secondary" onClick={useIncompatibleTranslation}>
                Bruk eksisterende oversettelse
              </Button>
              <Button size="small" variant="primary" onClick={startNewTranslation} icon={<PlusIcon aria-hidden />}>
                Start ny oversettelse
              </Button>
            </HStack>
          </VStack>
        )}
        {/*Preview:*/}
        {/*{currentTranslation && (*/}
        {/*  <div*/}
        {/*    dangerouslySetInnerHTML={{ __html: htmlUtils.json2HtmlString(currentTranslation as HtmlAsJsonElement) }}*/}
        {/*  />*/}
        {/*)}*/}
        {currentTranslation?.type === 'Element' &&
          currentTranslation.children.map((translationElement, index) => {
            const originalTextElement =
              htmlElementAsJson?.type === 'Element' ? htmlElementAsJson.children[index] : undefined;
            return (
              <TranslationFormHtmlInput
                key={`html-translation-${translationElement.id}`}
                text={translationElement['textContent'] ?? ''}
                htmlElementAsJson={originalTextElement}
                currentTranslation={translationElement}
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
